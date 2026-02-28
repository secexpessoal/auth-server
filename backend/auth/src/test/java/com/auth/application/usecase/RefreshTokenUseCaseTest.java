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

    private UserAuth testUser;
    private RefreshToken oldToken;

    @BeforeEach
    void setUp() {
        testUser = new UserAuth();
        testUser.setEmail("test@example.com");
        testUser.setRoles(java.util.Set.of(Role.USER));
        testUser.setActive(true);

        UserData userData = new UserData();
        userData.setUserName("testuser");
        userData.setUser(testUser);
        testUser.setUserData(userData);

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
        AuthenticationResult result = refreshTokenUseCase.execute(request);
        AuthenticationResponseDto response = result.responseDto();

        // Assert
        assertNotNull(response);
        assertEquals("new-jwt", response.session().accessToken());
        assertEquals("new-refresh-token", result.refreshToken());
        verify(userService).incrementTokenVersion(testUser);
        verify(refreshTokenService).verifyExpiration(oldToken);
    }
}
