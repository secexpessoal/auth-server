/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.*;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
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

import java.util.stream.Collectors;

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

    public AuthenticationResult execute(AuthenticationRequestDto loginRequest, String userAgent, String ipAddress, String origin, String referer) {
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
                .tokenVersion(refreshToken.getVersion()) // Agora retorna a versão da SESSÃO (que incrementa no re-login)
                .passwordResetRequired(user.isPasswordResetRequired())
                .build();

        UserProfileResponseDto profile = UserProfileResponseDto.builder()
                .username(user.getUserData().getUserName())
                .registration(user.getUserData().getRegistration())
                .position(user.getUserData().getPosition())
                .birthDate(user.getUserData().getBirthDate())
                .workRegime(user.getUserData().getWorkRegime())
                .livesElsewhere(user.getUserData().getLivesElsewhere() != null && user.getUserData().getLivesElsewhere())
                .inPersonWorkPeriod(InPersonWorkPeriodDto.builder()
                        .frequencyCycleWeeks(user.getUserData().getFrequencyCycleWeeks())
                        .frequencyWeekMask(user.getUserData().getFrequencyWeekMask())
                        .frequencyDurationDays(user.getUserData().getFrequencyDurationDays())
                        .build())
                .build();

        UserAuditResponseDto audit = UserAuditResponseDto.builder()
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUserData().getUpdatedAt())
                .updatedBy(user.getUserData().getUpdatedBy())
                .build();

        UserResponseDto userDto = UserResponseDto.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(it -> "ROLE_" + it.getRole()).collect(Collectors.toSet()))
                .active(user.getActive() != null && user.getActive())
                .profile(profile)
                .audit(audit)
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(userDto)
                .build();

        return new AuthenticationResult(responseDto, refreshToken.getToken());
    }
}
