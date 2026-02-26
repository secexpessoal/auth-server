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
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.User;
import com.auth.infra.security.service.JwtGeneratorService;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

    private final RefreshTokenService refreshTokenService;
    private final JwtGeneratorService jwtService;
    private final UserService userService;

    public AuthenticationResponseDto execute(RefreshTokenRequestDto request) {
        RefreshToken token = refreshTokenService.findByToken(request.refreshToken());
        refreshTokenService.verifyExpiration(token);

        User user = token.getUser();

        // Invalida o Access Token antigo
        userService.incrementTokenVersion(user);

        String jwt = jwtService.generateToken(user);
        // NOTE: Gera um novo refresh token e descarta o atual (Rotation)
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        MetadataUserResponseDto metadata = MetadataUserResponseDto.builder()
                .username(user.getUserName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();

        return AuthenticationResponseDto.builder()
                .token(jwt)
                .refreshToken(newRefreshToken.getToken())
                .metadata(metadata)
                .build();
    }
}
