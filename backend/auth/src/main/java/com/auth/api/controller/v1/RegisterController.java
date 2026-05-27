/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v1;

import com.auth.api.dto.auth.UserResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller responsável pelo registro de novos usuários.
 */
@RestController("registerControllerV1")
@RequiredArgsConstructor
@RequestMapping(value = "/user/register", version = "1")
@Tag(name = "Registro V1", description = "Endpoints para criação de novas contas de usuário")
public class RegisterController {

    private final UserService userService;

    // NOTE: Rota privada e só para ADMIN
    @PostMapping
    @Operation(summary = "Registra um novo usuário comum", description = "Cria uma conta com o cargo USER ou MANAGER.")
    public ResponseEntity<@NonNull UserResponseDto> register(@Valid @RequestBody RegisterRequestDto registerRequest) {
        Role requestedRole = registerRequest.role();
        
        if (requestedRole == Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        UserResponseDto result = userService.register(registerRequest, requestedRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // NOTE: Rota privada e só para ADMIN
    @PostMapping("/admin")
    @Operation(summary = "Registra um novo administrador", description = "Cria uma conta com o cargo ADMIN. Requer token de administrador.")
    public ResponseEntity<@NonNull UserResponseDto> registerAdmin(@Valid @RequestBody RegisterRequestDto registerRequest) {
        UserResponseDto result = userService.register(registerRequest, Role.ADMIN);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
