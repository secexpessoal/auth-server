/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivateUserUseCaseTest {

    @Mock
    private UserAuthRepository userRepository;

    @InjectMocks
    private ActivateUserUseCase activateUserUseCase;

    private UserAuth testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new UserAuth();
        testUser.setUserId(userId);
        testUser.setEmail("test@example.com");
        testUser.setActive(false);
        testUser.setRoles(Set.of(Role.USER));

        UserData userData = new UserData();
        userData.setUserName("testuser");
        userData.setUser(testUser);
        testUser.setUserData(userData);
    }

    @Test
    @DisplayName("Deve ativar um usuário desativado com sucesso")
    void deveAtivarUsuarioComSucesso() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act
        activateUserUseCase.execute(userId);

        // Assert
        assertTrue(testUser.getActive());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando o ID do usuário não existir")
    void deveLancarExceptionQuandoUsuarioNaoEncontrado() {
        // Arrange
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> activateUserUseCase.execute(userId));
        verify(userRepository, never()).save(any());
    }
}
