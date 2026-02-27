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
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UpdateUserProfileUseCase {

    private final UserAuthRepository userRepository;

    @Transactional
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
            data.setInPersonWorkStart(request.inPersonWorkPeriod().start());
            data.setInPersonWorkEnd(request.inPersonWorkPeriod().end());
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
                        .start(data.getInPersonWorkStart())
                        .end(data.getInPersonWorkEnd())
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
