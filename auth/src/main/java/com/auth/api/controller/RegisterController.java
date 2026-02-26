/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.usecase.RegisterUseCase;
import com.auth.domain.model.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller responsável pelo registro de novos usuários.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/user/register")
@Tag(name = "Registro", description = "Endpoints para criação de novas contas de usuário")
public class RegisterController {

    private final RegisterUseCase registerUseCase;

    @Operation(summary = "Registra um novo usuário comum", description = "Cria uma conta com o cargo USER. Aberto ao público.")
    @PostMapping
    public ResponseEntity<AuthenticationResponseDto> register(@Valid @RequestBody RegisterRequestDto registerRequest) {
        AuthenticationResponseDto response = registerUseCase.execute(registerRequest, Role.USER);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Registra um novo administrador", description = "Cria uma conta com o cargo ADMIN. Requer token de administrador.")
    @PostMapping("/admin")
    public ResponseEntity<AuthenticationResponseDto> registerAdmin(@Valid @RequestBody RegisterRequestDto registerRequest) {
        AuthenticationResponseDto response = registerUseCase.execute(registerRequest, Role.ADMIN);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
