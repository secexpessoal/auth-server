/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v2;

import com.auth.api.dto.auth.UserPositionChangeRequestDto;
import com.auth.application.usecase.UserPositionUseCase;
import com.auth.application.usecase.UserPositionHistoryUseCase;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserPositionHistory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController("userPositionControllerV2")
@RequiredArgsConstructor
@RequestMapping(value = "/user/positions", version = "2")
@Tag(name = "Cargos do Usuário V2", description = "Endpoints para atribuição de cargos e histórico")
public class UserPositionController {

    private final UserPositionUseCase userPositionUseCase;
    private final UserPositionHistoryUseCase userPositionHistoryUseCase;

    @PostMapping("/{userId}")
    @Operation(summary = "Altera o cargo de um usuário", description = "Atribui um novo cargo (definitivo ou temporário) a um usuário.")
    public ResponseEntity<Void> changePosition(
            @PathVariable UUID userId,
            @Valid @RequestBody UserPositionChangeRequestDto request,
            @AuthenticationPrincipal UserAuth admin) {

        userPositionUseCase.changePosition(
                userId,
                request.positionId(),
                request.eventType(),
                request.temporary(),
                request.endDate(),
                admin.getUsername(),
                request.reason()
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/history")
    @Operation(summary = "Lista o histórico de cargos", description = "Retorna o histórico completo de cargos de um usuário.")
    public ResponseEntity<List<UserPositionHistory>> getHistory(@PathVariable UUID userId) {
        return ResponseEntity.ok(userPositionHistoryUseCase.getByUser(userId));
    }

    @GetMapping("/history")
    @Operation(summary = "Histórico global de cargos", description = "Retorna todas as trocas de cargos realizadas no sistema (Auditoria Global).")
    public ResponseEntity<List<UserPositionHistory>> getGlobalHistory() {
        return ResponseEntity.ok(userPositionHistoryUseCase.getGlobalHistory()); // No futuro pode ser paginado
    }
}
