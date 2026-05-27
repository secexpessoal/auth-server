/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.UserSessionResponseDto;
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.dto.VerifyAuthResult;
import com.auth.application.mapper.UserMapper;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.RefreshTokenRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final CookieService cookieService;
    private final JwtGeneratorService jwtService;
    private final UserMapper userMapper;

    @Value("${security.jwt.refresh-expiration-time}")
    private long refreshTokenExpiration;


    public RefreshToken createRefreshToken(UserAuth user, String userAgent, String ipAddress, String origin, String referer) {
        List<RefreshToken> existingTokens = refreshTokenRepository
                .findByUserAndUserAgentAndIpAddressAndOriginAndReferer(user, userAgent, ipAddress, origin, referer);

        if (existingTokens.size() > 1) {
            existingTokens.sort(Comparator.comparing(RefreshToken::getExpiryDate).reversed());
            List<RefreshToken> toDelete = existingTokens.subList(1, existingTokens.size());
            refreshTokenRepository.deleteAll(toDelete);
            
            // Mantém apenas o mais recente na lista para reaproveitamento
            RefreshToken newest = existingTokens.get(0);
            existingTokens.clear();
            existingTokens.add(newest);
        }

        RefreshToken refreshToken = existingTokens.stream()
                .findFirst()
                .orElseGet(() -> RefreshToken.builder()
                        .user(user)
                        .userAgent(userAgent)
                        .ipAddress(ipAddress)
                        .origin(origin)
                        .referer(referer)
                        .version(0)
                        .build());

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpiration));
        refreshToken.setVersion(refreshToken.getVersion() + 1);

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Refresh token expirado. Por favor, faça login novamente.");
        }
        return token;
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException(ErrorCode.UNAUTHORIZED, "Refresh token inválido ou não encontrado."));
    }


    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }


    public void deleteByUser(UserAuth user) {
        refreshTokenRepository.deleteByUser(user);
    }

    public List<ResponseCookie> logout(String refreshToken) {
        if (refreshToken != null) {
            deleteByToken(refreshToken);
        }

        ResponseCookie refreshTokenLogoutCookie = cookieService.buildRefreshTokenLogoutCookie();
        ResponseCookie accessTokenLogoutCookie = cookieService.buildAccessTokenLogoutCookie();

        return List.of(refreshTokenLogoutCookie, accessTokenLogoutCookie);
    }

    public AuthenticationResult refreshToken(RefreshTokenRequestDto request) {
        RefreshToken token = findByToken(request.refreshToken());
        verifyExpiration(token);

        UserAuth user = token.getUser();
        String jwt = jwtService.generateToken(user);

        deleteByToken(request.refreshToken());
        RefreshToken newRefreshToken = createRefreshToken(user,
                token.getUserAgent(), token.getIpAddress(), token.getOrigin(), token.getReferer());

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(jwt)
                .tokenVersion(newRefreshToken.getVersion())
                .passwordResetRequired(user.isPasswordResetRequired())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(userMapper.toResponse(user))
                .build();

        return new AuthenticationResult(responseDto, newRefreshToken.getToken());
    }

    public VerifyAuthResult verifyAuth(String refreshToken, String userAgent, String ipAddress, String origin, String referer) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "O token é inválido ou ausente.");
        }
        
        RefreshToken token = findByToken(refreshToken);
        verifyExpiration(token);
        
        validateMetadata(token, userAgent, ipAddress);
        
        UserAuth userAuth = token.getUser();
        if (!Boolean.TRUE.equals(userAuth.getActive())) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "O token é inválido ou o usuário está inativo.");
        }
        
        String newAccessToken = jwtService.generateToken(userAuth);
        
        deleteByToken(refreshToken);
        RefreshToken newRefreshToken = createRefreshToken(userAuth, userAgent, ipAddress, origin, referer);
        
        log.info("Renovação silenciosa concluída para usuário: {}. Novo Refresh Token gerado.", userAuth.getEmail());
        
        return new VerifyAuthResult(newAccessToken, newRefreshToken.getToken());
    }

    private void validateMetadata(RefreshToken token, String userAgent, String ipAddress) {
        if (token.getUserAgent() != null && !token.getUserAgent().equals(userAgent)) {
            log.warn("Tentativa de renovação com User-Agent diferente! Esperado: {}, Recebido: {}", token.getUserAgent(), userAgent);
            deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (User-Agent divergente).");
        }

        if (token.getIpAddress() != null && !token.getIpAddress().equals(ipAddress)) {
            log.warn("Tentativa de renovação com IP diferente! Esperado: {}, Recebido: {}", token.getIpAddress(), ipAddress);
            deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (IP divergente).");
        }
    }

    public List<ResponseCookie> buildAuthCookies(String refreshToken, String accessToken, String redirectUri) {
        List<ResponseCookie> cookies = new ArrayList<>();
        
        cookies.add(cookieService.buildRefreshTokenCookie(refreshToken));
        cookies.add(cookieService.buildAccessTokenCookie(accessToken));

        if (redirectUri != null) {
            cookies.add(cookieService.buildSsoRedirectCookie(redirectUri));
        }

        return cookies;
    }
    
    public List<ResponseCookie> buildAuthCookies(String refreshToken, String accessToken) {
        return buildAuthCookies(refreshToken, accessToken, null);
    }
}
