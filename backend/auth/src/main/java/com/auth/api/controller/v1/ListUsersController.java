/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v1;

import com.auth.api.v1.dto.auth.UserResponseDto;
import com.auth.api.v1.dto.common.PaginatedResponseDto;
import com.auth.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller responsável pela listagem de usuários com paginação e filtros.
 */
@RestController("listUsersControllerV1")
@RequiredArgsConstructor
@RequestMapping(value = "/user", version = "1")
@Tag(name = "Usuários V1", description = "Endpoints para consulta e listagem de usuários")
public class ListUsersController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lista usuários com filtros e paginação", description = "Retorna uma lista paginada de usuários. Permite filtrar por e-mail, nome e cargo.")
    public ResponseEntity<PaginatedResponseDto<UserResponseDto>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String position,
            HttpServletRequest request) {

        String requestUrl = request.getRequestURL().toString();
        PaginatedResponseDto<UserResponseDto> response = userService.listUsers(page, limit, requestUrl, email, userName, position);

        return ResponseEntity.ok(response);
    }
}
