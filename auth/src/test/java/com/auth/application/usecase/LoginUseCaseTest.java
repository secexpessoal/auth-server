/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.AuthenticationRequestDto;
import com.auth.api.dto.auth.AuthenticationResponseDto;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginUseCaseTest {

    @Mock
    private AuthenticationManager authManager;
    @Mock
    private JwtGeneratorService jwtService;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private UserService userService;

    @InjectMocks
    private LoginUseCase loginUseCase;

    private User testUser;
    private AuthenticationRequestDto loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(UUID.randomUUID());
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.USER);
        testUser.setActive(true);

        loginRequest = new AuthenticationRequestDto("test@example.com", "password");
    }

    @Test
    @DisplayName("Deve realizar login com sucesso e retornar tokens e metadados")
    void shouldLoginSuccessfully() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(testUser);
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        
        when(jwtService.generateToken(testUser)).thenReturn("fake-jwt-token");
        
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("fake-refresh-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(refreshToken);

        // Act
        AuthenticationResponseDto response = loginUseCase.execute(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("fake-jwt-token", response.token());
        assertEquals("fake-refresh-token", response.refreshToken());
        assertEquals("testuser", response.metadata().username());
        assertEquals("test@example.com", response.metadata().email());
        assertEquals("USER", response.metadata().role());
        
        verify(userService).incrementTokenVersion(testUser);
        verify(authManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Deve lançar BadCredentialsException quando a senha for inválida")
    void shouldThrowExceptionWhenCredentialsAreInvalid() {
        // Arrange
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Usuário ou senha inválidos"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> loginUseCase.execute(loginRequest));
        verify(userService, never()).incrementTokenVersion(any());
    }
}
