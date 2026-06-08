/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v1;

import com.auth.api.v1.dto.auth.UpdateUserProfileRequestDto;
import com.auth.api.v1.dto.auth.UpdateUserRolesRequestDto;
import com.auth.api.v1.dto.auth.UserResponseDtoV1;
import com.auth.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import jakarta.validation.Valid;

/**
 * Controller responsável por atualizar o status de usuários.
 */
@RestController("userStatusControllerV1")
@RequiredArgsConstructor
@RequestMapping(value = "/user", version = "1")
@Tag(name = "Usuários V1", description = "Endpoints para gestão de status de contas de usuário")
public class UserStatusController {

    private final UserService userService;

    // NOTE: Rota privada e só para ADMIN
    @PatchMapping("/deactivate")
    @Operation(summary = "Desativa um usuário", description = "Altera o status do usuário para inativo. Requer cargo ADMIN e ID via parâmetro.")
    public ResponseEntity<@NonNull Void> deactivateUser(@RequestParam UUID id) {
        userService.updateStatus(id, false);
        return ResponseEntity.noContent().build();
    }

    // NOTE: Rota privada e só para ADMIN
    @PatchMapping("/activate")
    @Operation(summary = "Ativa um usuário", description = "Altera o status do usuário para ativo. Requer cargo ADMIN e ID via parâmetro.")
    public ResponseEntity<@NonNull Void> activateUser(@RequestParam UUID id) {
        userService.updateStatus(id, true);
        return ResponseEntity.noContent().build();
    }

    // NOTE: Rota autenticada
    @PatchMapping("/profile/{id}")
    @Operation(summary = "Atualiza o perfil do usuário", description = "Permite editar metadados do perfil do usuário. Requer cargo ADMIN.")
    public ResponseEntity<UserResponseDtoV1> updateProfile(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserProfileRequestDto request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    // NOTE: Rota privada e só para ADMIN
    @PatchMapping("/{id}/roles")
    @Operation(summary = "Atualiza os cargos do usuário", description = "Permite adicionar ou remover cargos do usuário. Requer cargo ADMIN.")
    public ResponseEntity<UserResponseDtoV1> updateRoles(
            @PathVariable UUID id,
            @RequestBody UpdateUserRolesRequestDto request) {
        return ResponseEntity.ok(userService.updateRoles(id, request));
    }
}
