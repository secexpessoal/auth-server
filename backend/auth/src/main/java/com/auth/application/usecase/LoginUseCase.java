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
import com.auth.api.dto.auth.MetadataUserResponseDto;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.User;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/**
 * Caso de Uso responsável pela orquestração do processo de login.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginUseCase {
    private final AuthenticationManager authManager;
    private final JwtGeneratorService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    public AuthenticationResult execute(AuthenticationRequestDto loginRequest) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        if (!(auth.getPrincipal() instanceof User user)) {
            log.error("Falha crítica: Principal não é do tipo User para o usuário {}", loginRequest.email());
            throw new BadRequestException(ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao recuperar dados do usuário autenticado");
        }

        log.info("Usuário {} autenticado com sucesso. Role: {}", user.getUsername(), user.getRole());

        userService.incrementTokenVersion(user);

        String jwt = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        MetadataUserResponseDto metadata = MetadataUserResponseDto.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .active(user.getActive() != null && user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .updatedBy(user.getUpdatedBy())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .token(jwt)
                .passwordResetRequired(user.isPasswordResetRequired())
                .metadata(metadata)
                .build();

        return new AuthenticationResult(responseDto, refreshToken.getToken());
    }
}
