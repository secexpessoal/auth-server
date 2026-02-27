/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

import com.auth.application.usecase.ActivateUserUseCase;
import com.auth.application.usecase.DeactivateUserUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller responsável por atualizar o status de usuários.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/user")
@Tag(name = "Usuários", description = "Endpoints para gestão de status de contas de usuário")
public class UserStatusController {

    private final DeactivateUserUseCase deactivateUserUseCase;
    private final ActivateUserUseCase activateUserUseCase;

    @PatchMapping("/deactivate")
    @Operation(summary = "Desativa um usuário", description = "Altera o status do usuário para inativo. Requer cargo ADMIN e ID via parâmetro.")
    public ResponseEntity<Void> deactivateUser(@RequestParam UUID id) {
        deactivateUserUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/activate")
    @Operation(summary = "Ativa um usuário", description = "Altera o status do usuário para ativo. Requer cargo ADMIN e ID via parâmetro.")
    public ResponseEntity<Void> activateUser(@RequestParam UUID id) {
        activateUserUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
