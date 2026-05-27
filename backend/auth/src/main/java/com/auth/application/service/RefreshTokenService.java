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
import com.auth.application.dto.AuthMetadata;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.dto.VerifyAuthResult;
import com.auth.application.dto.VerifyAuthStatus;
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
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
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

    public void logout(String refreshToken) {
        if (refreshToken != null) {
            deleteByToken(refreshToken);
        }
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

    /**
     * Processa a verificação de sessão para Forward Auth.
     * Toma todas as decisões de negócio: validação, renovação proativa ou silenciosa.
     */
    public VerifyAuthResult verifyAuth(String accessToken, String refreshToken, AuthMetadata metadata) {
        // 1. Valida o access_token se presente
        if (accessToken != null && !accessToken.isBlank() && jwtService.isTokenValid(accessToken)) {
            
            // PROACTIVE REFRESH: Se o token é válido mas expira em menos de 5 minutos
            if (jwtService.isTokenAboutToExpire(accessToken, 5) && refreshToken != null && !refreshToken.isBlank()) {
                log.info("Access token próximo da expiração. Tentando Proactive Refresh.");
                try {
                    return performSilentRenewal(refreshToken, metadata, true);
                } catch (Exception exception) {
                    log.warn("Falha no Proactive Refresh, mantendo token atual: {}", exception.getMessage());
                }
            }

            return VerifyAuthResult.builder()
                    .status(VerifyAuthStatus.AUTHORIZED)
                    .accessToken(accessToken)
                    .build();
        }

        // 2. Se access_token for inválido/ausente, tenta renovar usando o refresh_token
        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                log.info("Access token inválido ou ausente. Tentando renovação silenciosa.");
                return performSilentRenewal(refreshToken, metadata, false);
            } catch (Exception exception) {
                log.warn("Falha na renovação silenciosa: {}", exception.getMessage());
            }
        }

        // 3. Se tudo falhar, redireciona
        return VerifyAuthResult.builder()
                .status(VerifyAuthStatus.UNAUTHORIZED)
                .build();
    }

    private VerifyAuthResult performSilentRenewal(String refreshToken, AuthMetadata metadata, boolean proactive) {
        RefreshToken token = findByToken(refreshToken);
        verifyExpiration(token);
        
        validateMetadata(token, metadata.userAgent(), metadata.ipAddress());
        
        UserAuth userAuth = token.getUser();
        if (!Boolean.TRUE.equals(userAuth.getActive())) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário inativo.");
        }
        
        String newAccessToken = jwtService.generateToken(userAuth);
        
        deleteByToken(refreshToken);
        RefreshToken newRefreshToken = createRefreshToken(userAuth, 
                metadata.userAgent(), metadata.ipAddress(), metadata.origin(), metadata.referer());
        
        log.info("{} concluída para: {}.", proactive ? "Renovação proativa" : "Renovação silenciosa", userAuth.getEmail());
        
        return VerifyAuthResult.builder()
                .status(VerifyAuthStatus.RENEWED)
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .build();
    }

    private void validateMetadata(RefreshToken token, String userAgent, String ipAddress) {
        if (token.getUserAgent() != null && !token.getUserAgent().equals(userAgent)) {
            log.warn("User-Agent divergente! Esperado: {}, Recebido: {}", token.getUserAgent(), userAgent);
            deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (User-Agent).");
        }

        if (token.getIpAddress() != null && !token.getIpAddress().equals(ipAddress)) {
            log.warn("IP divergente! Esperado: {}, Recebido: {}", token.getIpAddress(), ipAddress);
            deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (IP).");
        }
    }
}
