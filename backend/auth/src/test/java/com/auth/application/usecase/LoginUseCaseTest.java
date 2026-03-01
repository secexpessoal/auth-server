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
import com.auth.application.dto.AuthenticationResult;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
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

    private UserAuth testUser;
    private AuthenticationRequestDto loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new UserAuth();
        testUser.setUserId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setRoles(java.util.Set.of(Role.USER));
        testUser.setActive(true);

        UserData userData = new UserData();
        userData.setUserName("testuser");
        userData.setUser(testUser);
        testUser.setUserData(userData);

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
        refreshToken.setVersion(1);
        when(refreshTokenService.createRefreshToken(any(), any(), any(), any(), any())).thenReturn(refreshToken);

        // Act
        AuthenticationResult result = loginUseCase.execute(loginRequest, "Mozilla", "127.0.0.1", "origin", "referer");
        AuthenticationResponseDto response = result.responseDto();

        // Assert
        assertNotNull(response);
        assertEquals("fake-jwt-token", response.session().accessToken());
        assertEquals("fake-refresh-token", result.refreshToken());
        assertEquals(1, response.session().tokenVersion());
        assertEquals("test@example.com", response.user().email());
        assertTrue(response.user().roles().contains("ROLE_USER"));
        
        verify(authManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Deve lançar BadCredentialsException quando a senha for inválida")
    void shouldThrowExceptionWhenCredentialsAreInvalid() {
        // Arrange
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Usuário ou senha inválidos"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> loginUseCase.execute(loginRequest, "Mozilla", "127.0.0.1", "origin", "referer"));
        verify(userService, never()).incrementTokenVersion(any());
    }
}
