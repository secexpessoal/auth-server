/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.token.RefreshTokenRequestDto;
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
class RefreshTokenUseCaseTest {

    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private JwtGeneratorService jwtService;
    @Mock
    private UserService userService;

    @InjectMocks
    private RefreshTokenUseCase refreshTokenUseCase;

    private User testUser;
    private RefreshToken oldToken;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.USER);
        testUser.setActive(true);

        oldToken = new RefreshToken();
        oldToken.setToken("old-refresh-token");
        oldToken.setUser(testUser);
    }

    @Test
    @DisplayName("Deve rotacionar o token com sucesso")
    void shouldRefreshSuccessfully() {
        // Arrange
        RefreshTokenRequestDto request = new RefreshTokenRequestDto("old-refresh-token");
        
        when(refreshTokenService.findByToken("old-refresh-token")).thenReturn(oldToken);
        when(jwtService.generateToken(testUser)).thenReturn("new-jwt");
        
        RefreshToken newToken = new RefreshToken();
        newToken.setToken("new-refresh-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(newToken);

        // Act
        AuthenticationResponseDto response = refreshTokenUseCase.execute(request);

        // Assert
        assertNotNull(response);
        assertEquals("new-jwt", response.token());
        assertEquals("new-refresh-token", response.refreshToken());
        verify(userService).incrementTokenVersion(testUser);
        verify(refreshTokenService).verifyExpiration(oldToken);
    }
}
