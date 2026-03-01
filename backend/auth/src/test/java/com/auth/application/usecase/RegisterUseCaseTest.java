/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.UserResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.service.PasswordGeneratorService;
import com.auth.application.service.UserService;
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

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegisterUseCaseTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordGeneratorService passwordGeneratorService;

    @InjectMocks
    private RegisterUseCase registerUseCase;

    private UserAuth testUser;
    private RegisterRequestDto registerRequest;

    @BeforeEach
    void setUp() {
        testUser = new UserAuth();
        testUser.setUserId(UUID.randomUUID());
        testUser.setEmail("new@example.com");
        testUser.setRoles(java.util.Set.of(Role.USER));
        testUser.setActive(true);

        UserData userData = new UserData();
        userData.setUserName("newuser");
        userData.setUser(testUser);
        testUser.setUserData(userData);

        registerRequest = new RegisterRequestDto("newuser", "new@example.com", Role.USER);
    }

    @Test
    @DisplayName("Deve registrar um usuário com sucesso e retornar metadados com senha temporária")
    void shouldRegisterSuccessfully() {
        // Arrange
        String mockTempPass = "SecureTemp123!";
        when(passwordGeneratorService.generateTemporaryPassword()).thenReturn(mockTempPass);
        when(userService.userRegister(eq(registerRequest), eq(Role.USER), eq(mockTempPass))).thenReturn(testUser);

        // Act
        UserResponseDto response = registerUseCase.execute(registerRequest, Role.USER);

        // Assert
        assertNotNull(response);
        assertEquals(mockTempPass, response.tempPassword());
        assertEquals("new@example.com", response.email());
        verify(userService).userRegister(eq(registerRequest), eq(Role.USER), eq(mockTempPass));
    }
}
