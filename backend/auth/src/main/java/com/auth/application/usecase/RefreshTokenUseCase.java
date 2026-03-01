/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.*;
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

    private final RefreshTokenService refreshTokenService;
    private final JwtGeneratorService jwtService;
    private final UserService userService;

    public AuthenticationResult execute(RefreshTokenRequestDto request) {
        RefreshToken token = refreshTokenService.findByToken(request.refreshToken());
        refreshTokenService.verifyExpiration(token);

        UserAuth user = token.getUser();
        String jwt = jwtService.generateToken(user);

        // NOTE: Deleta o token de refresh ATUAL antes de gerar o novo (Rotação segura por sessão)
        refreshTokenService.deleteByToken(request.refreshToken());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user,
                token.getUserAgent(), token.getIpAddress(), token.getOrigin(), token.getReferer());

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(jwt)
                .tokenVersion(newRefreshToken.getVersion())
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
                .roles(user.getRoles().stream().map(r -> "ROLE_" + r.getRole()).collect(Collectors.toSet()))
                .active(user.getActive() != null && user.getActive())
                .profile(profile)
                .audit(audit)
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(userDto)
                .build();
                
        return new AuthenticationResult(responseDto, newRefreshToken.getToken());
    }
}
