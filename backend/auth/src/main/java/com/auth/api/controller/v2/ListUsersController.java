/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v2;

import com.auth.api.v1.dto.common.PaginatedResponseDto;
import com.auth.api.v2.dto.auth.UserResponseDtoV2;
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
 * Controller responsável pela listagem de usuários V2.
 */
@RestController("listUsersControllerV2")
@RequiredArgsConstructor
@RequestMapping(value = "/user", version = "2")
@Tag(name = "Usuários V2", description = "Endpoints para consulta e listagem de usuários com perfil expandido")
public class ListUsersController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lista usuários com filtros e paginação V2", description = "Retorna uma lista paginada de usuários com perfis expandidos.")
    public ResponseEntity<PaginatedResponseDto<UserResponseDtoV2>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String position,
            HttpServletRequest request) {

        // TODO: Implementar mapeamento da entidade para UserResponseDto V2 no Service ou Mapper correspondente.
        // O serviço atual retorna o DTO da V1.
        PaginatedResponseDto<UserResponseDtoV2> response = userService.listUsersV2(page, limit, request.getRequestURL().toString(), email, userName, position);

        return ResponseEntity.ok(response);
    }
}
