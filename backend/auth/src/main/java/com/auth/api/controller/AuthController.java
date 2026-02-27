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
import com.auth.application.usecase.LoginUseCase;
import com.auth.application.usecase.RefreshTokenUseCase;
import com.auth.application.usecase.ValidationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
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

    @PostMapping("/login")
    @Operation(summary = "Realiza o login do usuário", description = "Valida as credenciais, retorna JWT no JSON e envia Refresh Token num cookie HttpOnly.")
    public ResponseEntity<@NonNull AuthenticationResponseDto> login(@Valid @RequestBody AuthenticationRequestDto loginRequest) {
        AuthenticationResult result = loginUseCase.execute(loginRequest);

        ResponseCookie cookie = cookieService.buildRefreshTokenCookie(result.refreshToken());

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(result.responseDto());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renova o token de acesso", description = "Lê o Refresh Token do cookie HttpOnly e retorna um novo Access Token.")
    public ResponseEntity<@NonNull AuthenticationResponseDto> refresh(@CookieValue(value = "refresh_token", required = true) String refreshTokenCookie) {
        RefreshTokenRequestDto refreshRequest = new RefreshTokenRequestDto(refreshTokenCookie);
        AuthenticationResult result = refreshTokenUseCase.execute(refreshRequest);

        // NOTE: Renova (roda) o cookie do refresh token
        ResponseCookie cookie = cookieService.buildRefreshTokenCookie(result.refreshToken());
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(result.responseDto());
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout do usuário", description = "Invalida a sessão destruindo o cookie no navegador.")
    public ResponseEntity<@NonNull Void> logout() {
        ResponseCookie cookie = cookieService.buildLogoutCookie();

        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    @GetMapping("/profile")
    @Operation(summary = "Retorna o perfil do usuário logado", description = "Extrai informações detalhadas do usuário a partir do token JWT enviado no Header.")
    public ResponseEntity<@NonNull UserResponseDto> validateToken(Authentication authentication) {
        UserResponseDto response = validationUseCase.execute(authentication);
        return ResponseEntity.ok(response);
    }
}
