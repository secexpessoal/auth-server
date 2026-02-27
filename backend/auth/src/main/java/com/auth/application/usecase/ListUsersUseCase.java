/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.MetadataUserResponseDto;
import com.auth.api.dto.common.PaginatedResponseDto;
import com.auth.api.dto.common.PaginationMetaDto;
import com.auth.domain.model.User;
import com.auth.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Caso de Uso responsável por listar os usuários com paginação.
 */
@Service
@RequiredArgsConstructor
public class ListUsersUseCase {

    private final UserRepository userRepository;

    public PaginatedResponseDto<MetadataUserResponseDto> execute(int page, int limit, String requestUrl) {
        Pageable pageable = PageRequest.of(page, limit);
        Page<User> usersPage = userRepository.findAll(pageable);

        List<MetadataUserResponseDto> data = usersPage.getContent().stream()
                .map(user -> MetadataUserResponseDto.builder()
                        .id(user.getUserId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole() != null ? user.getRole().name() : null)
                        .active(user.getActive() != null && user.getActive())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .updatedBy(user.getUpdatedBy())
                        .build())
                .toList();

        PaginationMetaDto paginationMeta = PaginationMetaDto.builder()
                .page(usersPage.getNumber())
                .limit(usersPage.getSize())
                .totalItems(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .hasNext(usersPage.hasNext())
                .hasPrevious(usersPage.hasPrevious())
                .build();

        String nextLink = usersPage.hasNext() ? requestUrl + "?page=" + (page + 1) + "&limit=" + limit : "";
        String prevLink = usersPage.hasPrevious() ? requestUrl + "?page=" + (page - 1) + "&limit=" + limit : "";

        return PaginatedResponseDto.<MetadataUserResponseDto>builder()
                .data(data)
                .meta(Map.of("pagination", paginationMeta))
                .links(Map.of("next", nextLink, "prev", prevLink))
                .build();
    }
}
