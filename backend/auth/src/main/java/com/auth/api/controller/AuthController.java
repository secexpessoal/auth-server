/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

import com.auth.api.dto.auth.AuthenticationRequestDto;
import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.service.CookieService;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.usecase.LoginUseCase;
import com.auth.application.usecase.RefreshTokenUseCase;
import com.auth.application.usecase.ValidationUseCase;
import com.auth.infra.util.RequestUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsável pela autenticação e gestão de sessão.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/user")
@Tag(name = "Autenticação", description = "Endpoints para login, renovação de token e perfil")
public class AuthController {

    private final LoginUseCase loginUseCase;
    private final CookieService cookieService;
    private final ValidationUseCase validationUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final RefreshTokenService refreshTokenService;

    // NOTE: Rota publica
    @PostMapping("/login")
    @Operation(summary = "Realiza o login do usuário", description = "Valida as credenciais, retorna JWT no JSON e envia Refresh Token num cookie HttpOnly.")
    public ResponseEntity<@NonNull AuthenticationResponseDto> login(
            @Valid @RequestBody AuthenticationRequestDto loginRequest,
            @RequestHeader(value = HttpHeaders.ORIGIN, required = false) String origin,
            @RequestHeader(value = HttpHeaders.REFERER, required = false) String referer,
            @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
            jakarta.servlet.http.HttpServletRequest request) {

        String ipAddress = RequestUtil.getClientIP(request);
        AuthenticationResult result = loginUseCase.execute(loginRequest, userAgent, ipAddress, origin, referer);

        ResponseCookie refreshTokenCookie = cookieService.buildRefreshTokenCookie(result.refreshToken());
        ResponseCookie accessTokenCookie = cookieService.buildAccessTokenCookie(result.responseDto().session().accessToken());

        var responseBuilder = ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        // Se houver redirectUri, enviamos o cookie de controle para o SsoRedirectFilter
        if (result.responseDto().redirectUri() != null) {
            ResponseCookie ssoCookie = cookieService.buildSsoRedirectCookie(result.responseDto().redirectUri());
            responseBuilder.header(HttpHeaders.SET_COOKIE, ssoCookie.toString());
        }

        return responseBuilder.body(result.responseDto());
    }

    // NOTE: Rota publica
    @PostMapping("/refresh")
    @Operation(summary = "Renova o token de acesso", description = "Lê o Refresh Token do cookie HttpOnly e retorna um novo Access Token.")
    public ResponseEntity<@NonNull AuthenticationResponseDto> refresh(@CookieValue(value = "refresh_token", required = true) String refreshTokenCookie) {
        RefreshTokenRequestDto refreshRequest = new RefreshTokenRequestDto(refreshTokenCookie);
        AuthenticationResult result = refreshTokenUseCase.execute(refreshRequest);

        // NOTE: Renova (roda) o cookie do refresh token
        ResponseCookie newRefreshTokenCookie = cookieService.buildRefreshTokenCookie(result.refreshToken());
        ResponseCookie newAccessTokenCookie = cookieService.buildAccessTokenCookie(result.responseDto().session().accessToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newRefreshTokenCookie.toString())
                .header(HttpHeaders.SET_COOKIE, newAccessTokenCookie.toString())
                .body(result.responseDto());
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout do usuário", description = "Invalida a sessão destruindo o cookie no navegador e removendo o token do banco.")
    public ResponseEntity<Void> logout(@CookieValue(value = "refresh_token", required = false) String refreshToken) {
        if (refreshToken != null) {
            refreshTokenService.deleteByToken(refreshToken);
        }

        ResponseCookie refreshTokenLogoutCookie = cookieService.buildRefreshTokenLogoutCookie();
        ResponseCookie accessTokenLogoutCookie = cookieService.buildAccessTokenLogoutCookie();

        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "/login")
                .header(HttpHeaders.SET_COOKIE, refreshTokenLogoutCookie.toString())
                .header(HttpHeaders.SET_COOKIE, accessTokenLogoutCookie.toString())
                .build();
    }

    // NOTE: Rota privada, usuário precisa mandar o token
    @GetMapping("/profile")
    @Operation(summary = "Retorna o perfil do usuário logado", description = "Extrai informações detalhadas do usuário a partir do token JWT enviado no Header.")
    public ResponseEntity<@NonNull UserResponseDto> validateToken(Authentication authentication) {
        UserResponseDto response = validationUseCase.execute(authentication);
        return ResponseEntity.ok(response);
    }
}
