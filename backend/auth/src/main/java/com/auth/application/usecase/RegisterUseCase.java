/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.*;
import com.auth.application.service.PasswordGeneratorService;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Caso de Uso responsável pelo registro de novos usuários.
 */
@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserService userService;
    private final PasswordGeneratorService passwordGeneratorService;

    public UserResponseDto execute(RegisterRequestDto request, Role role) {
        String tempPassword = passwordGeneratorService.generateTemporaryPassword();

        UserAuth user = Optional.ofNullable(userService.userRegister(request, role, tempPassword))
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao registrar usuário"));

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

        return UserResponseDto.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(r -> "ROLE_" + r.getRole()).collect(Collectors.toSet()))
                .active(user.getActive() != null && user.getActive())
                .profile(profile)
                .audit(audit)
                .tempPassword(tempPassword)
                .build();
    }
}
