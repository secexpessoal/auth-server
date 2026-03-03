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
import com.auth.domain.model.UserData;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UpdateUserProfileUseCase {

    private final UserAuthRepository userRepository;


    public UserResponseDto execute(UUID userId, UpdateUserProfileRequestDto request) {
        UserAuth user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado"));

        UserData data = user.getUserData();
        
        if (request.username() != null) data.setUserName(request.username());
        if (request.position() != null) data.setPosition(request.position());
        if (request.birthDate() != null) data.setBirthDate(request.birthDate());
        if (request.workRegime() != null) data.setWorkRegime(request.workRegime());
        if (request.registration() != null) data.setRegistration(request.registration());
        if (request.livesElsewhere() != null) data.setLivesElsewhere(request.livesElsewhere());
        
        if (request.inPersonWorkPeriod() != null) {
            Integer cycles = request.inPersonWorkPeriod().frequencyCycleWeeks();
            Integer mask = request.inPersonWorkPeriod().frequencyWeekMask();
            Integer duration = request.inPersonWorkPeriod().frequencyDurationDays();

            // NOTE: A mascara de dias da semanada ganha do tempo integral, caso ambos sejam informados
            if (mask != null && mask > 0 && duration != null) {
                duration = null;
            }
            
            if (duration != null && duration > 365) {
                throw new com.auth.infra.exception.custom.BadRequestException(ErrorCode.BAD_REQUEST, "A duração consecutiva não pode ultrapassar 365 dias");
            }

            data.setFrequencyCycleWeeks(cycles != null ? cycles : 1);
            data.setFrequencyWeekMask(duration != null ? 0 : (mask != null ? mask : 0));
            data.setFrequencyDurationDays(duration);
        }

        userRepository.save(user);

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
