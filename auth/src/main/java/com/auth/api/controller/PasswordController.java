/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

import com.auth.api.dto.password.ChangePasswordRequestDto;
import com.auth.api.dto.password.FirstChangePasswordRequestDto;
import com.auth.api.dto.password.ResetPasswordRequestDto;
import com.auth.application.usecase.PasswordUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller responsável pela gestão de senhas e recuperação de acesso.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/password")
@Tag(name = "Senhas", description = "Endpoints para troca e reset de senhas")
public class PasswordController {

    private final PasswordUseCase passwordUseCase;

    @Operation(summary = "Troca voluntária de senha", description = "Altera a senha do usuário logado mediante confirmação da senha antiga.")
    @PostMapping("/change")
    public ResponseEntity<Map<String, String>> changePassword(Authentication authentication, 
                                                              @Valid @RequestBody ChangePasswordRequestDto request) {
        passwordUseCase.changePassword(authentication, request);
        return ResponseEntity.ok(Map.of("status", "Senha alterada com sucesso"));
    }

    @Operation(summary = "Troca de senha de primeiro acesso", description = "Define uma nova senha definitiva após o primeiro login ou reset administrativo.")
    @PostMapping("/first-change")
    public ResponseEntity<Map<String, String>> firstChange(Authentication authentication, 
                                                           @Valid @RequestBody FirstChangePasswordRequestDto request) {
        passwordUseCase.changeFirstPassword(authentication, request);
        return ResponseEntity.ok(Map.of("status", "Senha de primeiro acesso atualizada com sucesso"));
    }

    @Operation(summary = "Reset administrativo de senha", description = "Gera uma senha temporária para um usuário. Requer cargo ADMIN.")
    @PostMapping("/admin-reset")
    public ResponseEntity<Map<String, String>> resetByAdmin(@Valid @RequestBody ResetPasswordRequestDto request) {
        String tempPass = passwordUseCase.resetByAdmin(request);
        return ResponseEntity.ok(Map.of(
                "status", "Senha resetada pelo administrador",
                "temp_password", tempPass
        ));
    }
}
