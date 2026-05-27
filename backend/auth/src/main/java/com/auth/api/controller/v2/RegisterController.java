/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v2;

import com.auth.api.v1.dto.auth.RegisterRequestDto;
import com.auth.api.v2.dto.auth.RegisterResponseDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("registerControllerV2")
@RequiredArgsConstructor
@RequestMapping(value = "/user", version = "2")
@Tag(name = "Registro V2", description = "Endpoints para criação de novos usuários")
public class RegisterController {

    private final UserService userService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Registra um novo usuário V2", description = "Cria um usuário com o papel especificado (USER ou MANAGER) e retorna a senha temporária.")
    public ResponseEntity<@NonNull RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        Role requestedRole = request.role();

        if (requestedRole == Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        var result = userService.register(request, requestedRole);
        
        RegisterResponseDto v2Response = RegisterResponseDto.builder()
                .email(result.email())
                .tempPassword(result.tempPassword())
                .build();

        return ResponseEntity.ok(v2Response);
    }

    @PostMapping("/register/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Registra um novo administrador V2", description = "Cria um usuário com o papel ADMIN e retorna a senha temporária.")
    public ResponseEntity<@NonNull RegisterResponseDto> registerAdmin(@Valid @RequestBody RegisterRequestDto request) {
        var result = userService.register(request, Role.ADMIN);

        RegisterResponseDto v2Response = RegisterResponseDto.builder()
                .email(result.email())
                .tempPassword(result.tempPassword())
                .build();

        return ResponseEntity.ok(v2Response);
    }
}
