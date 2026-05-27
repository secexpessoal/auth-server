/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v1;

import com.auth.api.dto.password.ChangePasswordRequestDto;
import com.auth.api.dto.password.FirstChangePasswordRequestDto;
import com.auth.api.dto.password.ResetPasswordRequestDto;
import com.auth.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller responsável pela gestão de senhas e recuperação de acesso.
 */
@RestController("passwordControllerV1")
@RequiredArgsConstructor
@RequestMapping(value = "/password", version = "1")
@Tag(name = "Senhas V1", description = "Endpoints para troca e reset de senhas")
public class PasswordController {

    private final UserService userService;

    // NOTE: Rota autenticada
    @Operation(summary = "Troca voluntária de senha", description = "Altera a senha do usuário logado mediante confirmação da senha antiga.")
    @PostMapping("/change")
    public ResponseEntity<@NonNull Map<String, String>> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequestDto request) {
        userService.changePassword(authentication, request);
        return ResponseEntity.ok(Map.of("status", "Senha alterada com sucesso"));
    }

    // NOTE: Rota autenticada, pela primeira senha/random
    @Operation(summary = "Troca de senha de primeiro acesso", description = "Define uma nova senha definitiva após o primeiro login ou reset administrativo.")
    @PostMapping("/first-change")
    public ResponseEntity<@NonNull Map<String, String>> firstChange(Authentication authentication, @Valid @RequestBody FirstChangePasswordRequestDto request) {
        userService.changeFirstPassword(authentication, request);
        return ResponseEntity.ok(Map.of("status", "Senha de primeiro acesso atualizada com sucesso"));
    }

    // NOTE: Rota pública para recuperação de senha
    @Operation(summary = "Reset de senha pelo próprio usuário", description = "Verifica o e-mail e envia uma senha temporária via Resend.")
    @PostMapping("/user-reset")
    public ResponseEntity<@NonNull Map<String, String>> resetByUser(@Valid @RequestBody ResetPasswordRequestDto request) {
        userService.resetByUser(request);
        return ResponseEntity.ok(Map.of(
                "status", "Se o e-mail existir em nossa base, uma nova senha foi enviada"
        ));
    }

    // NOTE: Rota privada e só para ADMIN
    @Operation(summary = "Reset administrativo de senha", description = "Gera uma senha temporária para um usuário. Requer cargo ADMIN.")
    @PostMapping("/admin-reset")
    public ResponseEntity<@NonNull Map<String, String>> resetByAdmin(@Valid @RequestBody ResetPasswordRequestDto request) {
        String tempPass = userService.resetByAdmin(request);
        return ResponseEntity.ok(Map.of(
                "status", "Senha resetada pelo administrador",
                "tempPassword", tempPass
        ));
    }
}
