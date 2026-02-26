/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import com.auth.infra.security.service.JwtGeneratorService;
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
    private JwtGeneratorService jwtService;
    @Mock
    private RefreshTokenService refreshTokenService;

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

        registerRequest = new RegisterRequestDto("newuser", "new@example.com", "password123");
    }

    @Test
    @DisplayName("Deve registrar um usuário com sucesso e retornar tokens")
    void shouldRegisterSuccessfully() {
        // Arrange
        when(userService.userRegister(registerRequest, Role.USER)).thenReturn(testUser);
        when(jwtService.generateToken(testUser)).thenReturn("fake-jwt-token");
        
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("fake-refresh-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(refreshToken);

        // Act
        AuthenticationResponseDto response = registerUseCase.execute(registerRequest, Role.USER);

        // Assert
        assertNotNull(response);
        assertEquals("fake-jwt-token", response.token());
        assertEquals("fake-refresh-token", response.refreshToken());
        assertEquals("newuser", response.metadata().username());
        assertEquals("new@example.com", response.metadata().email());
        verify(userService).userRegister(registerRequest, Role.USER);
    }
}
