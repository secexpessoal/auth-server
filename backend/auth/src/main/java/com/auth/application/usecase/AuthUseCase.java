/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.AuthenticationRequestDto;
import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.api.dto.auth.UserSessionResponseDto;
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.dto.VerifyAuthResult;
import com.auth.application.mapper.UserMapper;
import com.auth.application.service.CookieService;
import com.auth.application.service.RedirectService;
import com.auth.application.service.RefreshTokenService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthUseCase {

    private final AuthenticationManager authManager;
    private final JwtGeneratorService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;
    private final RedirectService redirectService;
    private final CookieService cookieService;

    public AuthenticationResult login(AuthenticationRequestDto loginRequest, String userAgent, String ipAddress, String origin, String referer) {
        String validatedRedirect = redirectService.validateRedirectUri(loginRequest.redirectUri());

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        if (!(auth.getPrincipal() instanceof UserAuth user)) {
            log.error("Falha crítica: Principal não é do tipo UserAuth para o usuário {}", loginRequest.email());
            throw new BadRequestException(ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao recuperar dados do usuário autenticado");
        }

        log.info("Usuário {} autenticado com sucesso via IP {}. Roles: {}", user.getEmail(), ipAddress, user.getRoles());

        String jwt = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, userAgent, ipAddress, origin, referer);

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(jwt)
                .tokenVersion(refreshToken.getVersion())
                .passwordResetRequired(user.isPasswordResetRequired())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(userMapper.toResponse(user))
                .redirectUri(validatedRedirect)
                .build();

        return new AuthenticationResult(responseDto, refreshToken.getToken());
    }

    public List<ResponseCookie> logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenService.deleteByToken(refreshToken);
        }

        ResponseCookie refreshTokenLogoutCookie = cookieService.buildRefreshTokenLogoutCookie();
        ResponseCookie accessTokenLogoutCookie = cookieService.buildAccessTokenLogoutCookie();

        return List.of(refreshTokenLogoutCookie, accessTokenLogoutCookie);
    }

    public AuthenticationResult refreshToken(RefreshTokenRequestDto request) {
        RefreshToken token = refreshTokenService.findByToken(request.refreshToken());
        refreshTokenService.verifyExpiration(token);

        UserAuth user = token.getUser();
        String jwt = jwtService.generateToken(user);

        refreshTokenService.deleteByToken(request.refreshToken());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user,
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
        
        RefreshToken token = refreshTokenService.findByToken(refreshToken);
        refreshTokenService.verifyExpiration(token);
        
        validateMetadata(token, userAgent, ipAddress);
        
        UserAuth userAuth = token.getUser();
        if (!Boolean.TRUE.equals(userAuth.getActive())) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "O token é inválido ou o usuário está inativo.");
        }
        
        String newAccessToken = jwtService.generateToken(userAuth);
        
        refreshTokenService.deleteByToken(refreshToken);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(userAuth, userAgent, ipAddress, origin, referer);
        
        log.info("Renovação silenciosa concluída para usuário: {}. Novo Refresh Token gerado.", userAuth.getEmail());
        
        return new VerifyAuthResult(newAccessToken, newRefreshToken.getToken());
    }

    private void validateMetadata(RefreshToken token, String userAgent, String ipAddress) {
        if (token.getUserAgent() != null && !token.getUserAgent().equals(userAgent)) {
            log.warn("Tentativa de renovação com User-Agent diferente! Esperado: {}, Recebido: {}", token.getUserAgent(), userAgent);
            refreshTokenService.deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (User-Agent divergente).");
        }

        if (token.getIpAddress() != null && !token.getIpAddress().equals(ipAddress)) {
            log.warn("Tentativa de renovação com IP diferente! Esperado: {}, Recebido: {}", token.getIpAddress(), ipAddress);
            refreshTokenService.deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (IP divergente).");
        }
    }

    public UserResponseDto validateToken(Authentication authentication) {
        UserAuth user = (UserAuth) Optional.ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof UserAuth)
                .orElseThrow(() -> new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado ou sessão inválida"));

        return userMapper.toResponse(user);
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
