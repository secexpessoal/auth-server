/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v2.mapper;

import com.auth.api.v1.dto.auth.InPersonWorkPeriodDto;
import com.auth.api.v1.dto.auth.UserAuditResponseDto;
import com.auth.api.v2.dto.auth.PositionResponseDto;
import com.auth.api.v2.dto.auth.UserProfileResponseDto;
import com.auth.api.v2.dto.auth.UserResponseDtoV2;
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
public class AuthMapper {

    private final PositionRepository positionRepository;

    public UserResponseDtoV2 toResponse(UserAuth user) {
        return toResponse(user, null);
    }

    public UserResponseDtoV2 toResponse(UserAuth user, Map<UUID, Position> positionCache) {
        UserData profileData = user.getUserProfile();
        
        UserProfileResponseDto profile = null;
        UserAuditResponseDto audit = UserAuditResponseDto.builder()
                .createdAt(user.getCreatedAt())
                .build();

        boolean positionMissing = true;

        if (profileData != null) {
            Position position = null;
            if (profileData.getCurrentPosition() != null && profileData.getCurrentPosition().getPositionId() != null) {
                UUID posId = profileData.getCurrentPosition().getPositionId();
                if (positionCache != null) {
                    position = positionCache.get(posId);
                } else {
                    position = positionRepository.findById(posId).orElse(null);
                }
            }

            PositionResponseDto positionDto = null;
            if (position != null) {
                positionDto = new PositionResponseDto(
                    position.getId(), 
                    position.getName(), 
                    position.isActive(), 
                    position.getCreatedAt()
                );
                positionMissing = false;
            }

            profile = UserProfileResponseDto.builder()
                    .username(profileData.getUserName())
                    .registration(profileData.getRegistration())
                    .position(positionDto)
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

        return UserResponseDtoV2.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .roles(roles)
                .active(user.getActive() != null && user.getActive())
                .profile(profile)
                .audit(audit)
                .build();
    }

    public boolean isProfileSetupRequired(UserAuth user) {
        UserData profileData = user.getUserProfile();
        boolean positionMissing = true;
        if (profileData != null && profileData.getCurrentPosition() != null && profileData.getCurrentPosition().getPositionId() != null) {
            positionMissing = false;
        }

        return profileData == null || 
               profileData.getUserName() == null || profileData.getUserName().isBlank() ||
               profileData.getRegistration() == null || profileData.getRegistration().isBlank() ||
               positionMissing;
    }
}
