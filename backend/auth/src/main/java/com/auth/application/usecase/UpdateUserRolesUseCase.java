/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.UpdateUserRolesRequestDto;
import com.auth.api.dto.auth.UserAuditResponseDto;
import com.auth.api.dto.auth.UserProfileResponseDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.api.dto.auth.InPersonWorkPeriodDto;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UpdateUserRolesUseCase {

    private final UserAuthRepository userRepository;


    public UserResponseDto execute(UUID userId, UpdateUserRolesRequestDto request) {
        UserAuth user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado"));

        if (request.roles() == null || request.roles().isEmpty()) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, "O usuário deve possuir pelo menos uma Role");
        }

        user.getRoles().clear();
        user.getRoles().addAll(request.roles());
        
        userRepository.save(user);

        UserData data = user.getUserData();

        // Build Response
        UserProfileResponseDto profile = UserProfileResponseDto.builder()
                .username(data.getUserName())
                .registration(data.getRegistration())
                .position(data.getPosition())
                .birthDate(data.getBirthDate())
                .workRegime(data.getWorkRegime())
                .livesElsewhere(data.getLivesElsewhere() != null && data.getLivesElsewhere())
                .inPersonWorkPeriod(InPersonWorkPeriodDto.builder()
                        .frequencyCycleWeeks(data.getFrequencyCycleWeeks())
                        .frequencyWeekMask(data.getFrequencyWeekMask())
                        .frequencyDurationDays(data.getFrequencyDurationDays())
                        .build())
                .build();

        UserAuditResponseDto audit = UserAuditResponseDto.builder()
                .createdAt(user.getCreatedAt())
                .updatedAt(data.getUpdatedAt())
                .updatedBy(data.getUpdatedBy())
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
