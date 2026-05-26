/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.UserSessionResponseDto;
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.mapper.UserMapper;
import com.auth.application.service.RefreshTokenService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

    private final RefreshTokenService refreshTokenService;
    private final JwtGeneratorService jwtService;
    private final UserMapper userMapper;

    public AuthenticationResult execute(RefreshTokenRequestDto request) {
        RefreshToken token = refreshTokenService.findByToken(request.refreshToken());
        refreshTokenService.verifyExpiration(token);

        UserAuth user = token.getUser();
        String jwt = jwtService.generateToken(user);

        refreshTokenService.deleteByToken(request.refreshToken());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user,
                token.getUserAgent(), token.getIpAddress(), token.getOrigin(), token.getReferer());

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(jwt)
                .tokenVersion(newRefreshToken.getVersion())
                .passwordResetRequired(user.isPasswordResetRequired())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(userMapper.toResponse(user))
                .build();

        return new AuthenticationResult(responseDto, newRefreshToken.getToken());
    }
}
