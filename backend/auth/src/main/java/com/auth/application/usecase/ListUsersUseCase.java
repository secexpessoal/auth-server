/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.UserResponseDto;
import com.auth.api.dto.common.PaginatedResponseDto;
import com.auth.api.dto.common.PaginationMetaDto;
import com.auth.application.mapper.UserMapper;
import com.auth.domain.model.Position;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Caso de Uso responsável por listar os usuários com paginação e filtros.
 * Implementa a lógica de busca relacional para o MongoDB.
 */
@Service
@RequiredArgsConstructor
public class ListUsersUseCase {

    private final MongoTemplate mongoTemplate;
    private final PositionRepository positionRepository;
    private final UserMapper userMapper;

    public PaginatedResponseDto<UserResponseDto> execute(int page, int limit, String requestUrl, String email, String userName, String positionName) {
        Pageable pageable = PageRequest.of(page, limit);

        List<UUID> matchingUserIds = null;

        // Se houver filtros que pertencem à coleção 'user_profiles' (UserData)
        if (isProfileFilterPresent(userName, positionName)) {
            matchingUserIds = findUserIdsByProfileFilters(userName, positionName);

            if (matchingUserIds.isEmpty()) {
                return buildEmptyResponse(page, limit);
            }
        }

        // Constrói a query principal na coleção 'users' (UserAuth)
        Query query = new Query();
        if (email != null && !email.isBlank()) {
            query.addCriteria(Criteria.where("email").regex(Pattern.quote(email), "i"));
        }

        if (matchingUserIds != null) {
            query.addCriteria(Criteria.where("_id").in(matchingUserIds));
        }

        long totalCount = mongoTemplate.count(Query.of(query), UserAuth.class);
        query.with(pageable);

        List<UserAuth> users = mongoTemplate.find(query, UserAuth.class);
        Page<UserAuth> usersPage = new PageImpl<>(users, pageable, totalCount);

        // Pre-cache de cargos para otimizar o mapeamento (Evita N+1 de lookup)
        Map<UUID, String> positionNameCache = positionRepository.findAll().stream().collect(Collectors.toMap(Position::getId, Position::getName));

        List<UserResponseDto> data = usersPage.getContent().stream().map(userItem -> userMapper.toResponse(userItem, positionNameCache)).toList();

        return buildPaginatedResponse(usersPage, data, requestUrl, email, userName, positionName);
    }

    private boolean isProfileFilterPresent(String userName, String positionName) {
        return (userName != null && !userName.isBlank()) || (positionName != null && !positionName.isBlank());
    }

    private List<UUID> findUserIdsByProfileFilters(String userName, String positionName) {
        Query dataQuery = new Query();

        if (userName != null && !userName.isBlank()) {
            dataQuery.addCriteria(Criteria.where("name").regex(Pattern.quote(userName), "i"));
        }

        if (positionName != null && !positionName.isBlank()) {
            List<UUID> matchingPositionIds = positionRepository.findAll()
                    .stream()
                    .filter(positionItem -> positionItem.getName().toLowerCase().contains(positionName.toLowerCase()))
                    .map(Position::getId)
                    .toList();

            if (matchingPositionIds.isEmpty()) {
                return List.of();
            }

            // Busca pelo campo mapeado como snake_case no MongoDB
            dataQuery.addCriteria(Criteria.where("current_position.position_id").in(matchingPositionIds));
        }

        return mongoTemplate.find(dataQuery, UserData.class).stream().map(UserData::getUserId).toList();
    }

    private PaginatedResponseDto<UserResponseDto> buildPaginatedResponse(Page<UserAuth> page, List<UserResponseDto> data, String url, String email, String name, String pos) {
        PaginationMetaDto meta = PaginationMetaDto.builder()
                .page(page.getNumber())
                .limit(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        String queryParams = buildQueryParams(email, name, pos);

        String nextLink = page.hasNext()
                ? String.format("%s?page=%d&limit=%d%s", url, page.getNumber() + 1, page.getSize(), queryParams)
                : "";

        String prevLink = page.hasPrevious()
                ? String.format("%s?page=%d&limit=%d%s", url, page.getNumber() - 1, page.getSize(), queryParams)
                : "";

        return PaginatedResponseDto.<UserResponseDto>builder()
                .data(data)
                .meta(Map.of("pagination", meta))
                .links(Map.of("next", nextLink, "prev", prevLink))
                .build();
    }

    private String buildQueryParams(String email, String name, String pos) {
        StringBuilder params = new StringBuilder();
        if (email != null && !email.isBlank()) params.append("&email=").append(email);
        if (name != null && !name.isBlank()) params.append("&userName=").append(name);
        if (pos != null && !pos.isBlank()) params.append("&position=").append(pos);

        return params.toString();
    }

    private PaginatedResponseDto<UserResponseDto> buildEmptyResponse(int page, int limit) {
        PaginationMetaDto meta = PaginationMetaDto.builder()
                .page(page)
                .limit(limit)
                .totalItems(0L)
                .totalPages(0)
                .hasNext(false)
                .hasPrevious(false)
                .build();

        return PaginatedResponseDto.<UserResponseDto>builder()
                .data(List.of())
                .meta(Map.of("pagination", meta))
                .links(Map.of("next", "", "prev", ""))
                .build();
    }
}
