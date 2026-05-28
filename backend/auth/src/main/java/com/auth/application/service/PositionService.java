/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.api.v2.dto.auth.PositionUpdateDto;
import com.auth.domain.model.Position;
import com.auth.domain.repository.PositionRepository;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;

    public List<Position> getAllActive() {
        return positionRepository.findAllByActiveTrue();
    }

    public List<Position> getAll() {
        return positionRepository.findAll();
    }

    public Position create(String name) {
        Position position = Position.builder()
                .name(name)
                .active(true)
                .build();
        return positionRepository.save(position);
    }

    public Position update(UUID id, PositionUpdateDto request) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cargo não encontrado"));

        if (request.name() != null && !request.name().isBlank()) {
            position.setName(request.name());
        }

        if (request.active() != null) {
            position.setActive(request.active());
        }

        return positionRepository.save(position);
    }

    public Position toggleStatus(UUID id) {
        Position position = positionRepository.findById(id).orElseThrow(() -> new NotFoundException("Cargo não encontrado"));
        position.setActive(!position.isActive());
        return positionRepository.save(position);
    }
}
