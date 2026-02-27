/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.MetadataUserResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Caso de Uso responsável pelo registro de novos usuários.
 */
@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserService userService;

    public MetadataUserResponseDto execute(RegisterRequestDto request, Role role) {
        String tempPassword = "Temp@" + (1000 + (int) (Math.random() * 8999));

        User user = Optional.ofNullable(userService.userRegister(request, role, tempPassword))
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao registrar usuário"));

        return MetadataUserResponseDto.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .active(user.getActive() != null && user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt() : user.getCreatedAt())
                .tempPassword(tempPassword)
                .build();
    }
}
