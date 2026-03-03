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
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListUsersUseCaseTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ListUsersUseCase listUsersUseCase;

    private UserAuth testUser;

    @BeforeEach
    void setUp() {
        testUser = new UserAuth();
        testUser.setUserId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setActive(true);
        testUser.setRoles(Set.of(Role.USER));

        UserData userData = new UserData();
        userData.setUserName("testuser");
        userData.setRegistration("12345");
        userData.setUser(testUser);
        testUser.setUserData(userData);
    }

    @Test
    @DisplayName("Deve retornar uma lista paginada de usuários com sucesso")
    void deveRetornarListaPaginadaComSucesso() {
        // Arrange
        when(mongoTemplate.count(any(Query.class), eq(UserAuth.class))).thenReturn(1L);
        when(mongoTemplate.find(any(Query.class), eq(UserAuth.class))).thenReturn(List.of(testUser));

        // Act
        PaginatedResponseDto<UserResponseDto> result = listUsersUseCase.execute(0, 10, "/v1/user", null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.data().size());
        assertEquals("test@example.com", result.data().get(0).email());
        assertEquals("testuser", result.data().get(0).profile().username());
    }

    @Test
    @DisplayName("Deve incluir metadados de paginação e links na resposta")
    void deveIncluirMetadadosELinks() {
        // Arrange
        when(mongoTemplate.count(any(Query.class), eq(UserAuth.class))).thenReturn(1L);
        when(mongoTemplate.find(any(Query.class), eq(UserAuth.class))).thenReturn(List.of(testUser));

        // Act
        PaginatedResponseDto<UserResponseDto> result = listUsersUseCase.execute(0, 10, "/v1/user", null, null, null);

        // Assert
        assertNotNull(result.meta());
        assertTrue(result.meta().containsKey("pagination"));
        assertNotNull(result.links());
        assertEquals("", result.links().get("next"));
        assertEquals("", result.links().get("prev"));
    }
}
