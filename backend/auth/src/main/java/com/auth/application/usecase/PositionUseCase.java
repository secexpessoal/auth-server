/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.PositionUpdateDto;
import com.auth.domain.model.Position;
import com.auth.application.service.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PositionUseCase {

    private final PositionService positionService;

    public Position create(String name) {
        return positionService.create(name);
    }

    public List<Position> getActive() {
        return positionService.getAllActive();
    }

    public List<Position> getAll() {
        return positionService.getAll();
    }

    public Position toggleStatus(UUID id) {
        return positionService.toggleStatus(id);
    }

    public Position update(UUID id, PositionUpdateDto request) {
        return positionService.update(id, request);
    }
}
