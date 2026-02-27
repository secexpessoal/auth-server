/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

import com.auth.api.dto.auth.UserResponseDto;
import com.auth.api.dto.common.PaginatedResponseDto;
import com.auth.application.usecase.ListUsersUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller responsável por listar usuários cadastrados.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/user")
@Tag(name = "Usuários", description = "Endpoints para gestão de contas de usuário")
public class ListUsersController {

    private final ListUsersUseCase listUsersUseCase;

    @GetMapping
    @Operation(summary = "Lista usuários com paginação", description = "Retorna uma lista de usuários cadastrados no formato paginado. Apenas para ADMIN.")
    public ResponseEntity<@NonNull PaginatedResponseDto<UserResponseDto>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int limit,
            HttpServletRequest request
    ) {
        String requestUrl = request.getRequestURL().toString();
        PaginatedResponseDto<UserResponseDto> response = listUsersUseCase.execute(page, limit, requestUrl);
        return ResponseEntity.ok(response);
    }
}
