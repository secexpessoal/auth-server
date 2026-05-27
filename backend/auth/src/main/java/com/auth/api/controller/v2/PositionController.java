/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v2;

import com.auth.api.dto.auth.PositionRequestDto;
import com.auth.api.dto.auth.PositionResponseDto;
import com.auth.application.service.PositionService;
import com.auth.domain.model.Position;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController("positionControllerV2")
@RequiredArgsConstructor
@RequestMapping(value = "/positions", version = "2")
@Tag(name = "Cargos V2", description = "Endpoints para gestão do catálogo de cargos")
public class PositionController {

    private final PositionService positionService;

    @PostMapping
    @Operation(summary = "Cria um novo cargo", description = "Adiciona um cargo ao catálogo.")
    public ResponseEntity<PositionResponseDto> create(@RequestBody PositionRequestDto request) {
        Position position = positionService.create(request.name());
        return ResponseEntity.ok(mapToResponse(position));
    }

    @GetMapping
    @Operation(summary = "Lista todos os cargos", description = "Retorna todos os cargos cadastrados.")
    public ResponseEntity<List<PositionResponseDto>> getAll() {
        return ResponseEntity.ok(positionService.getAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/active")
    @Operation(summary = "Lista cargos ativos", description = "Retorna apenas os cargos marcados como ativos.")
    public ResponseEntity<List<PositionResponseDto>> getActive() {
        return ResponseEntity.ok(positionService.getAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Ativa/Desativa um cargo", description = "Inverte o status de atividade de um cargo no catálogo.")
    public ResponseEntity<PositionResponseDto> toggle(@PathVariable UUID id) {
        Position position = positionService.toggleStatus(id);
        return ResponseEntity.ok(mapToResponse(position));
    }

    private PositionResponseDto mapToResponse(Position position) {
        return new PositionResponseDto(position.getId(), position.getName(), position.isActive(), position.getCreatedAt());
    }
}
