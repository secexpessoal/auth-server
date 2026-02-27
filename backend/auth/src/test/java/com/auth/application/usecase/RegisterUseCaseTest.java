/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.MetadataUserResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegisterUseCaseTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private RegisterUseCase registerUseCase;

    private User testUser;
    private RegisterRequestDto registerRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(UUID.randomUUID());
        testUser.setUserName("newuser");
        testUser.setEmail("new@example.com");
        testUser.setRole(Role.USER);
        testUser.setActive(true);

        registerRequest = new RegisterRequestDto("newuser", "new@example.com");
    }

    @Test
    @DisplayName("Deve registrar um usuário com sucesso e retornar metadados com senha temporária")
    void shouldRegisterSuccessfully() {
        // Arrange
        when(userService.userRegister(eq(registerRequest), eq(Role.USER), anyString())).thenReturn(testUser);

        // Act
        MetadataUserResponseDto response = registerUseCase.execute(registerRequest, Role.USER);

        // Assert
        assertNotNull(response);
        assertNotNull(response.tempPassword());
        assertTrue(response.tempPassword().startsWith("Temp@"));
        assertEquals("newuser", response.username());
        assertEquals("new@example.com", response.email());
        verify(userService).userRegister(eq(registerRequest), eq(Role.USER), anyString());
    }
}
