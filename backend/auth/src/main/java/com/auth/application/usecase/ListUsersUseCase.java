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
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.domain.PageImpl;
import java.util.UUID;
import com.auth.domain.model.UserData;
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

    private final MongoTemplate mongoTemplate;

    public PaginatedResponseDto<UserResponseDto> execute(int page, int limit, String requestUrl, String email, String userName, String position) {
        Pageable pageable = PageRequest.of(page, limit);
        
        List<UUID> matchingUserIds = null;
        if ((userName != null && !userName.isBlank()) || (position != null && !position.isBlank())) {
            Query dataQuery = new Query();
            if (userName != null && !userName.isBlank()) dataQuery.addCriteria(Criteria.where("name").regex(userName, "i"));
            if (position != null && !position.isBlank()) dataQuery.addCriteria(Criteria.where("position").regex(position, "i"));
            List<UserData> userDatas = mongoTemplate.find(dataQuery, UserData.class);
            matchingUserIds = userDatas.stream().map(UserData::getUserId).toList();
            if (matchingUserIds.isEmpty()) {
                return buildEmptyResponse(page, limit);
            }
        }

        Query query = new Query();
        if (email != null && !email.isBlank()) {
            query.addCriteria(Criteria.where("email").regex(email, "i"));
        }
        if (matchingUserIds != null) {
            query.addCriteria(Criteria.where("_id").in(matchingUserIds));
        }

        long total = mongoTemplate.count(Query.of(query), UserAuth.class);
        query.with(pageable);
        List<UserAuth> users = mongoTemplate.find(query, UserAuth.class);
        
        Page<UserAuth> usersPage = new PageImpl<>(users, pageable, total);

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
                                    .frequencyCycleWeeks(user.getUserData().getFrequencyCycleWeeks())
                                    .frequencyWeekMask(user.getUserData().getFrequencyWeekMask())
                                    .frequencyDurationDays(user.getUserData().getFrequencyDurationDays())
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

        StringBuilder queryParams = new StringBuilder();
        if (email != null && !email.isBlank()) queryParams.append("&email=").append(email);
        if (userName != null && !userName.isBlank()) queryParams.append("&userName=").append(userName);
        if (position != null && !position.isBlank()) queryParams.append("&position=").append(position);

        String nextLink = usersPage.hasNext() ? requestUrl + "?page=" + (page + 1) + "&limit=" + limit + queryParams : "";
        String prevLink = usersPage.hasPrevious() ? requestUrl + "?page=" + (page - 1) + "&limit=" + limit + queryParams : "";

        return PaginatedResponseDto.<UserResponseDto>builder()
                .data(data)
                .meta(Map.of("pagination", paginationMeta))
                .links(Map.of("next", nextLink, "prev", prevLink))
                .build();
    }

    private PaginatedResponseDto<UserResponseDto> buildEmptyResponse(int page, int limit) {
        PaginationMetaDto paginationMeta = PaginationMetaDto.builder()
                .page(page)
                .limit(limit)
                .totalItems(0L)
                .totalPages(0)
                .hasNext(false)
                .hasPrevious(false)
                .build();
        return PaginatedResponseDto.<UserResponseDto>builder()
                .data(List.of())
                .meta(Map.of("pagination", paginationMeta))
                .links(Map.of("next", "", "prev", ""))
                .build();
    }
}
