/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.UserResponseDto;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.infra.exception.custom.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ValidationUseCaseTest {

    @InjectMocks
    private ValidationUseCase validationUseCase;

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
        userData.setUser(testUser);
        testUser.setUserData(userData);
    }

    @Test
    @DisplayName("Deve retornar o perfil do usuário autenticado com sucesso")
    void deveRetornarPerfilComSucesso() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(testUser);

        // Act
        UserResponseDto response = validationUseCase.execute(auth);

        // Assert
        assertNotNull(response);
        assertEquals("test@example.com", response.email());
        assertEquals("testuser", response.profile().username());
    }

    @Test
    @DisplayName("Deve lançar BadRequestException quando o principal não for UserAuth")
    void deveLancarExceptionQuandoPrincipalInvalido() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn("not-a-userauth");

        // Act & Assert
        assertThrows(BadRequestException.class, () -> validationUseCase.execute(auth));
    }

    @Test
    @DisplayName("Deve lançar BadRequestException quando a autenticação for nula")
    void deveLancarExceptionQuandoAuthNula() {
        // Act & Assert
        assertThrows(BadRequestException.class, () -> validationUseCase.execute(null));
    }
}
