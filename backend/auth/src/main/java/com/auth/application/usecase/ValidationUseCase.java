/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.*;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ValidationUseCase {

    public UserResponseDto execute(Authentication authentication) {
        UserAuth user = (UserAuth) Optional.ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof UserAuth)
                .orElseThrow(() -> new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado ou sessão inválida"));

        UserProfileResponseDto profile = UserProfileResponseDto.builder()
                .username(user.getUserData().getUserName())
                .registration(user.getUserData().getRegistration())
                .position(user.getUserData().getPosition())
                .birthDate(user.getUserData().getBirthDate())
                .workRegime(user.getUserData().getWorkRegime())
                .livesElsewhere(user.getUserData().getLivesElsewhere() != null && user.getUserData().getLivesElsewhere())
                .inPersonWorkPeriod(InPersonWorkPeriodDto.builder()
                        .start(user.getUserData().getInPersonWorkStart())
                        .end(user.getUserData().getInPersonWorkEnd())
                        .build())
                .build();

        UserAuditResponseDto audit = UserAuditResponseDto.builder()
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUserData().getUpdatedAt())
                .updatedBy(user.getUserData().getUpdatedBy())
                .build();

        return UserResponseDto.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(r -> "ROLE_" + r.getRole()).collect(Collectors.toSet()))
                .active(user.getActive() != null && user.getActive())
                .profile(profile)
                .audit(audit)
                .build();
    }
}
