/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v2;

import com.auth.api.v1.dto.auth.RegisterRequestDto;
import com.auth.api.v1.dto.auth.UserResponseDto;
import com.auth.api.v2.dto.auth.RegisterResponseDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
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
    @Operation(summary = "Registra um novo usuário V2", description = "Cria um usuário com papel USER e retorna a senha temporária em um objeto separado.")
    public ResponseEntity<@NonNull RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        // O UserService.register da V1 já gera a senha e retorna o DTO V1 com a senha.
        // Vamos extrair a senha do DTO V1 para o novo contrato V2.
        UserResponseDto v1Response = userService.register(request, Role.USER);
        
        RegisterResponseDto v2Response = RegisterResponseDto.builder()
                .user(v1Response)
                .tempPassword(v1Response.tempPassword())
                .build();

        return ResponseEntity.ok(v2Response);
    }
}
