/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.application.dto.VerifyAuthResult;
import com.auth.application.mapper.UserMapper;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.RefreshTokenRepository;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private CookieService cookieService;
    @Mock
    private JwtGeneratorService jwtService;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpiration", 3600000L);
    }

    @Test
    @DisplayName("Deve falhar se o token estiver expirado")
    void shouldThrowIfExpired() {
        RefreshToken token = RefreshToken.builder()
                .expiryDate(Instant.now().minusSeconds(10))
                .build();

        assertThrows(BadRequestException.class, () -> refreshTokenService.verifyExpiration(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    @DisplayName("Deve retornar o token se não estiver expirado")
    void shouldReturnTokenIfNotExpired() {
        RefreshToken token = RefreshToken.builder()
                .expiryDate(Instant.now().plusSeconds(60))
                .build();

        RefreshToken result = refreshTokenService.verifyExpiration(token);
        assertEquals(token, result);
    }

    @Test
    @DisplayName("Deve lançar exceção quando o token for nulo no verifyAuth")
    void shouldThrowWhenTokenIsNull() {
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> refreshTokenService.verifyAuth(null, "ua", "ip", null, null)
        );

        assertEquals("O token é inválido ou ausente.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando o usuário estiver inativo no verifyAuth")
    void shouldThrowWhenUserIsInactive() {
        String tokenString = "valid-token";
        UserAuth inactiveUser = new UserAuth();
        inactiveUser.setActive(false);
        
        RefreshToken token = RefreshToken.builder()
                .token(tokenString)
                .userAgent("ua")
                .ipAddress("ip")
                .expiryDate(Instant.now().plusSeconds(100))
                .user(inactiveUser)
                .build();

        when(refreshTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(token));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> refreshTokenService.verifyAuth(tokenString, "ua", "ip", null, null)
        );

        assertEquals("O token é inválido ou o usuário está inativo.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve retornar novos tokens quando válidos no verifyAuth")
    void shouldReturnNewTokensWhenValid() {
        String tokenString = "old-refresh";
        UserAuth user = new UserAuth();
        user.setEmail("user@test.com");
        user.setActive(true);
        
        RefreshToken oldToken = RefreshToken.builder()
                .token(tokenString)
                .userAgent("ua")
                .ipAddress("ip")
                .expiryDate(Instant.now().plusSeconds(100))
                .user(user)
                .build();

        RefreshToken newToken = RefreshToken.builder().token("new-refresh").build();

        when(refreshTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(oldToken));
        when(jwtService.generateToken(user)).thenReturn("new-jwt");
        when(refreshTokenRepository.save(any())).thenReturn(newToken);

        VerifyAuthResult result = refreshTokenService.verifyAuth(tokenString, "ua", "ip", null, null);

        assertEquals("new-jwt", result.accessToken());
        assertEquals("new-refresh", result.refreshToken());
        verify(refreshTokenRepository).deleteByToken(tokenString);
    }
}
