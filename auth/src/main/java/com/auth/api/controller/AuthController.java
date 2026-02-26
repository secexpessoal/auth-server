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
import com.auth.api.dto.auth.MetadataUserResponseDto;
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.application.usecase.LoginUseCase;
import com.auth.application.usecase.RefreshTokenUseCase;
import com.auth.application.usecase.ValidationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    private final ValidationUseCase validationUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;

    @Operation(summary = "Realiza o login do usuário", description = "Valida as credenciais e retorna o Access Token e Refresh Token.")
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDto> login(@Valid @RequestBody AuthenticationRequestDto loginRequest) {
        AuthenticationResponseDto response = loginUseCase.execute(loginRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Renova o token de acesso", description = "Recebe um Refresh Token válido e retorna um novo par de tokens.")
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto refreshRequest) {
        AuthenticationResponseDto response = refreshTokenUseCase.execute(refreshRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Retorna o perfil do usuário logado", description = "Extrai informações detalhadas do usuário a partir do token JWT enviado no Header.")
    @GetMapping("/profile")
    public ResponseEntity<MetadataUserResponseDto> validateToken(Authentication authentication) {
        MetadataUserResponseDto response = validationUseCase.execute(authentication);
        return ResponseEntity.ok(response);
    }
}
