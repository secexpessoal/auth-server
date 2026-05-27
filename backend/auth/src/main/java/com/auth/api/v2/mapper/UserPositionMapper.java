/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v2.mapper;

import com.auth.api.v2.dto.auth.UserPositionHistoryResponseDto;
import com.auth.domain.model.UserPositionHistory;
import org.springframework.stereotype.Component;

@Component
public class UserPositionMapper {

    public UserPositionHistoryResponseDto toResponse(UserPositionHistory history) {
        if (history == null) {
            return null;
        }

        return UserPositionHistoryResponseDto.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .eventType(history.getEventType())
                .fromPositionId(history.getFromPositionId())
                .fromPositionName(history.getFromPositionName())
                .toPositionId(history.getToPositionId())
                .toPositionName(history.getToPositionName())
                .temporary(history.isTemporary())
                .plannedEndDate(history.getPlannedEndDate())
                .occurredAt(history.getOccurredAt())
                .changedBy(history.getChangedBy())
                .reason(history.getReason())
                .build();
    }
}
