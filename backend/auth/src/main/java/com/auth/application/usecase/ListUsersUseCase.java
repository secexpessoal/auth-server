/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.*;
import com.auth.api.dto.common.PaginatedResponseDto;
import com.auth.api.dto.common.PaginationMetaDto;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.UserAuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Caso de Uso responsável por listar os usuários com paginação.
 */
@Service
@RequiredArgsConstructor
public class ListUsersUseCase {

    private final UserAuthRepository userRepository;

    public PaginatedResponseDto<UserResponseDto> execute(int page, int limit, String requestUrl) {
        Pageable pageable = PageRequest.of(page, limit);
        Page<UserAuth> usersPage = userRepository.findAll(pageable);

        List<UserResponseDto> data = usersPage.getContent().stream()
                .map(user -> {
                    UserProfileResponseDto profile = UserProfileResponseDto.builder()
                            .username(user.getUserData().getUserName())
                            .registration(user.getUserData().getRegistration())
                            .position(user.getUserData().getPosition())
                            .birthDate(user.getUserData().getBirthDate())
                            .workRegime(user.getUserData().getWorkRegime())
                            .livesElsewhere(user.getUserData().getLivesElsewhere() != null && user.getUserData().getLivesElsewhere())
                            .inPersonWorkPeriod(InPersonWorkPeriodDto.builder()
                                    .start(user.getUserData().getInPersonWorkStart())
                                    .end(user.getUserData().getInPersonWorkEnd())
                                    .build())
                            .build();

                    UserAuditResponseDto audit = UserAuditResponseDto.builder()
                            .createdAt(user.getCreatedAt())
                            .updatedAt(user.getUserData().getUpdatedAt())
                            .updatedBy(user.getUserData().getUpdatedBy())
                            .build();

                    return UserResponseDto.builder()
                            .id(user.getUserId())
                            .email(user.getEmail())
                            .roles(user.getRoles().stream().map(r -> "ROLE_" + r.getRole()).collect(Collectors.toSet()))
                            .active(user.getActive() != null && user.getActive())
                            .profile(profile)
                            .audit(audit)
                            .build();
                })
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

        return PaginatedResponseDto.<UserResponseDto>builder()
                .data(data)
                .meta(Map.of("pagination", paginationMeta))
                .links(Map.of("next", nextLink, "prev", prevLink))
                .build();
    }
}
