/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.InPersonWorkPeriodDto;
import com.auth.api.dto.auth.UpdateUserProfileRequestDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.application.mapper.UserMapper;
import com.auth.domain.model.Position;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.PositionRepository;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.domain.repository.UserDataRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateUserProfileUseCase {

    private final UserAuthRepository userRepository;
    private final UserDataRepository userDataRepository;
    private final PositionRepository positionRepository;
    private final UserMapper userMapper;

    public UserResponseDto execute(UUID userId, UpdateUserProfileRequestDto request) {
        UserAuth user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado"));

        InPersonWorkPeriodDto period = request.inPersonWorkPeriod();
        
        try {
            // 1. Atualiza dados do perfil via Aggregate Root
            user.updateProfile(
                request.username(),
                request.registration(),
                request.birthDate(),
                request.workRegime(),
                request.livesElsewhere(),
                period != null ? period.frequencyCycleWeeks() : null,
                period != null ? period.frequencyWeekMask() : null,
                period != null ? period.frequencyDurationDays() : null
            );

            // 2. Resolve lookup de cargo se enviado (Regra de Aplicação)
            if (request.position() != null && !request.position().isBlank()) {
                positionRepository.findAll().stream()
                        .filter(positionItem -> positionItem.getName().equalsIgnoreCase(request.position()))
                        .findFirst()
                        .ifPresent(positionItem -> user.assignPosition(positionItem.getId(), false, null));
            }

            // 3. Persistência Segura
            UserData profileToSave = user.getUserProfile();
            if (profileToSave == null) {
                throw new IllegalStateException("Falha crítica: O perfil do usuário desapareceu durante a atualização.");
            }

            userDataRepository.save(profileToSave);
            userRepository.save(user);

        } catch (IllegalArgumentException | IllegalStateException exception) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, exception.getMessage());
        }

        return userMapper.toResponse(user);
    }
}
