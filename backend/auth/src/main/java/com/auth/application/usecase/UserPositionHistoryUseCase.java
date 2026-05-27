/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.domain.model.UserPositionHistory;
import com.auth.domain.repository.UserPositionHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPositionHistoryUseCase {

    private final UserPositionHistoryRepository historyRepository;

    public List<UserPositionHistory> getGlobalHistory() {
        return historyRepository.findAll();
    }

    public List<UserPositionHistory> getByUser(UUID userId) {
        return historyRepository.findAllByUserIdOrderByOccurredAtDesc(userId);
    }
}
