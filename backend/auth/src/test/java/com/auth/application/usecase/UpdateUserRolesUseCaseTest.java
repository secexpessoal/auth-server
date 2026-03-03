/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.UpdateUserRolesRequestDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UpdateUserRolesUseCaseTest {

    @Mock
    private UserAuthRepository userRepository;

    @InjectMocks
    private UpdateUserRolesUseCase updateUserRolesUseCase;

    private UserAuth testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new UserAuth();
        testUser.setUserId(userId);
        testUser.setEmail("test@example.com");
        testUser.setActive(true);
        testUser.setRoles(new HashSet<>(Set.of(Role.USER)));

        UserData userData = new UserData();
        userData.setUserName("testuser");
        userData.setUpdatedAt(Instant.now());
        userData.setUser(testUser);
        testUser.setUserData(userData);
    }

    @Test
    @DisplayName("Deve atualizar os cargos de um usuário com sucesso")
    void deveAtualizarCargosComSucesso() {
        // Arrange
        UpdateUserRolesRequestDto request = UpdateUserRolesRequestDto.builder()
                .roles(Set.of(Role.ADMIN, Role.MANAGER))
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act
        UserResponseDto response = updateUserRolesUseCase.execute(userId, request);

        // Assert
        assertNotNull(response);
        assertEquals(2, testUser.getRoles().size());
        assertTrue(testUser.getRoles().contains(Role.ADMIN));
        assertTrue(testUser.getRoles().contains(Role.MANAGER));
        assertTrue(response.roles().contains("ROLE_ADMIN"));
        assertTrue(response.roles().contains("ROLE_MANAGER"));
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Deve lançar BadRequestException quando a lista de cargos estiver vazia")
    void deveLancarExceptionQuandoCargosVazio() {
        // Arrange
        UpdateUserRolesRequestDto request = UpdateUserRolesRequestDto.builder()
                .roles(Set.of())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> updateUserRolesUseCase.execute(userId, request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando o usuário não existir")
    void deveLancarExceptionQuandoUsuarioNaoEncontrado() {
        // Arrange
        UpdateUserRolesRequestDto request = UpdateUserRolesRequestDto.builder()
                .roles(Set.of(Role.ADMIN))
                .build();

        when(userRepository.findById(any())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> updateUserRolesUseCase.execute(userId, request));
        verify(userRepository, never()).save(any());
    }
}
