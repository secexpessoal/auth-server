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
import com.auth.api.dto.auth.UserSessionResponseDto;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.mapper.UserMapper;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.RedirectService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginUseCase {
    private final AuthenticationManager authManager;
    private final JwtGeneratorService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;
    private final RedirectService redirectService;

    public AuthenticationResult execute(AuthenticationRequestDto loginRequest, String userAgent, String ipAddress, String origin, String referer) {
        String validatedRedirect = redirectService.validateRedirectUri(loginRequest.redirectUri());

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        if (!(auth.getPrincipal() instanceof UserAuth user)) {
            log.error("Falha crítica: Principal não é do tipo UserAuth para o usuário {}", loginRequest.email());
            throw new BadRequestException(ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao recuperar dados do usuário autenticado");
        }

        log.info("Usuário {} autenticado com sucesso via IP {}. Roles: {}", user.getEmail(), ipAddress, user.getRoles());

        String jwt = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, userAgent, ipAddress, origin, referer);

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(jwt)
                .tokenVersion(refreshToken.getVersion())
                .passwordResetRequired(user.isPasswordResetRequired())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(userMapper.toResponse(user))
                .redirectUri(validatedRedirect)
                .build();

        return new AuthenticationResult(responseDto, refreshToken.getToken());
    }
}
