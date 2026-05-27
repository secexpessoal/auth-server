/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v1.mapper;

import com.auth.api.v1.dto.auth.*;
import com.auth.domain.model.Position;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final PositionRepository positionRepository;

    public UserResponseDtoV1 toResponse(UserAuth user) {
        return toResponse(user, null, null);
    }

    public com.auth.api.v2.dto.auth.UserResponseDtoV2 toResponseV2(UserAuth user) {
        Map<UUID, Position> positionCache = positionRepository.findAll().stream()
                .collect(Collectors.toMap(Position::getId, pos -> pos));
        
        UserData profileData = user.getUserProfile();
        com.auth.api.v2.dto.auth.UserProfileResponseDto profile = null;
        com.auth.api.v1.dto.auth.UserAuditResponseDto audit = com.auth.api.v1.dto.auth.UserAuditResponseDto.builder()
                .createdAt(user.getCreatedAt())
                .build();

        if (profileData != null) {
            com.auth.domain.model.Position pos = null;
            if (profileData.getCurrentPosition() != null && profileData.getCurrentPosition().getPositionId() != null) {
                pos = positionCache.get(profileData.getCurrentPosition().getPositionId());
            }

            com.auth.api.v2.dto.auth.PositionResponseDto positionDto = null;
            if (pos != null) {
                positionDto = new com.auth.api.v2.dto.auth.PositionResponseDto(
                        pos.getId(), pos.getName(), pos.isActive(), pos.getCreatedAt());
            }

            profile = com.auth.api.v2.dto.auth.UserProfileResponseDto.builder()
                    .username(user.getUsername())
                    .registration(profileData.getRegistration())
                    .position(positionDto)
                    .birthDate(profileData.getBirthDate())
                    .workRegime(profileData.getWorkRegime())
                    .livesElsewhere(profileData.getLivesElsewhere() != null && profileData.getLivesElsewhere())
                    .inPersonWorkPeriod(com.auth.api.v1.dto.auth.InPersonWorkPeriodDto.builder()
                            .frequencyCycleWeeks(profileData.getFrequencyCycleWeeks())
                            .frequencyWeekMask(profileData.getFrequencyWeekMask())
                            .frequencyDurationDays(profileData.getFrequencyDurationDays())
                            .build())
                    .build();

            audit = com.auth.api.v1.dto.auth.UserAuditResponseDto.builder()
                    .createdAt(user.getCreatedAt())
                    .updatedAt(profileData.getUpdatedAt())
                    .updatedBy(profileData.getUpdatedBy())
                    .build();
        }

        return com.auth.api.v2.dto.auth.UserResponseDtoV2.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .active(user.getActive() != null && user.getActive())
                .roles(user.getRoles().stream().map(r -> "ROLE_" + r.getRole()).collect(Collectors.toSet()))
                .profile(profile)
                .audit(audit)
                .build();
    }

    public UserResponseDtoV1 toResponse(UserAuth user, String tempPassword) {
        return toResponse(user, tempPassword, null);
    }

    public UserResponseDtoV1 toResponse(UserAuth user, Map<UUID, String> positionCache) {
        return toResponse(user, null, positionCache);
    }

    private UserResponseDtoV1 toResponse(UserAuth user, String tempPassword, Map<UUID, String> positionCache) {
        UserData profileData = user.getUserProfile();
        
        UserProfileResponseDto profile = null;
        UserAuditResponseDto audit = UserAuditResponseDto.builder()
                .createdAt(user.getCreatedAt())
                .build();

        if (profileData != null) {
            String positionName = null;
            if (profileData.getCurrentPosition() != null && profileData.getCurrentPosition().getPositionId() != null) {
                UUID posId = profileData.getCurrentPosition().getPositionId();
                if (positionCache != null) {
                    positionName = positionCache.get(posId);
                } else {
                    positionName = positionRepository.findById(posId)
                            .map(Position::getName)
                            .orElse(null);
                }
            }

            profile = UserProfileResponseDto.builder()
                    .username(user.getUsername()) // Usa o helper do UserAuth
                    .registration(profileData.getRegistration())
                    .position(positionName)
                    .birthDate(profileData.getBirthDate())
                    .workRegime(profileData.getWorkRegime())
                    .livesElsewhere(profileData.getLivesElsewhere() != null && profileData.getLivesElsewhere())
                    .inPersonWorkPeriod(InPersonWorkPeriodDto.builder()
                            .frequencyCycleWeeks(profileData.getFrequencyCycleWeeks())
                            .frequencyWeekMask(profileData.getFrequencyWeekMask())
                            .frequencyDurationDays(profileData.getFrequencyDurationDays())
                            .build())
                    .build();

            audit = UserAuditResponseDto.builder()
                    .createdAt(user.getCreatedAt())
                    .updatedAt(profileData.getUpdatedAt())
                    .updatedBy(profileData.getUpdatedBy())
                    .build();
        }

        Set<String> roles = user.getRoles().stream()
                .map(role -> "ROLE_" + role.getRole())
                .collect(Collectors.toSet());

        return UserResponseDtoV1.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .roles(roles)
                .active(user.getActive() != null && user.getActive())
                .profile(profile)
                .audit(audit)
                .tempPassword(tempPassword)
                .build();
    }
}
