/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.domain.model.UserPositionEventType;
import com.auth.application.service.UserPositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPositionUseCase {

    private final UserPositionService userPositionService;

    public void changePosition(UUID userId, UUID positionId, UserPositionEventType eventType, boolean temporary, Instant endDate, String adminUsername, String reason) {
        userPositionService.changePosition(userId, positionId, eventType, temporary, endDate, adminUsername, reason);
    }
}
