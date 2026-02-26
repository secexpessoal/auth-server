/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.MetadataUserResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;

import org.springframework.stereotype.Service;

import java.util.Optional;

import lombok.RequiredArgsConstructor;

/**
 * Caso de Uso responsável pelo registro de novos usuários.
 */
@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserService userService;
    private final JwtGeneratorService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthenticationResponseDto execute(RegisterRequestDto request, Role role) {
        User user = Optional.ofNullable(userService.userRegister(request, role))
                .orElseThrow(() -> new BadRequestException(ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao registrar usuário"));

        String jwt = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        MetadataUserResponseDto metadata = MetadataUserResponseDto.builder()
                .username(user.getUserName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .active(user.getActive() != null && user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt() : user.getCreatedAt())
                .build();

        return AuthenticationResponseDto.builder()
                .token(jwt)
                .refreshToken(refreshToken.getToken())
                .passwordResetRequired(user.isPasswordResetRequired())
                .metadata(metadata)
                .build();
    }
}
