/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.application.payload.AuthMetadata;
import com.auth.application.payload.VerifyAuthResult;
import com.auth.application.payload.VerifyAuthStatus;
import com.auth.api.v1.mapper.UserMapper;
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

    private AuthMetadata metadata;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpiration", 3600000L);
        metadata = new AuthMetadata("ua", "ip", null, null);
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
    @DisplayName("Deve retornar UNAUTHORIZED quando os tokens forem nulos no verifyAuth")
    void shouldReturnUnauthorizedWhenTokensAreNull() {
        VerifyAuthResult result = refreshTokenService.verifyAuth(null, null, metadata);
        assertEquals(VerifyAuthStatus.UNAUTHORIZED, result.status());
    }

    @Test
    @DisplayName("Deve retornar UNAUTHORIZED quando o usuário estiver inativo no verifyAuth")
    void shouldReturnUnauthorizedWhenUserIsInactive() {
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

        VerifyAuthResult result = refreshTokenService.verifyAuth(null, tokenString, metadata);

        assertEquals(VerifyAuthStatus.UNAUTHORIZED, result.status());
    }

    @Test
    @DisplayName("Deve retornar RENEWED quando o refresh token for válido no verifyAuth")
    void shouldReturnRenewedWhenValid() {
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
        when(refreshTokenRepository.deleteByToken(tokenString)).thenReturn(1L);
        when(refreshTokenRepository.save(any())).thenReturn(newToken);

        VerifyAuthResult result = refreshTokenService.verifyAuth(null, tokenString, metadata);

        assertEquals(VerifyAuthStatus.RENEWED, result.status());
        assertEquals("new-jwt", result.accessToken());
        assertEquals("new-refresh", result.refreshToken());
        verify(refreshTokenRepository).deleteByToken(tokenString);
    }

    @Test
    @DisplayName("Deve retornar AUTHORIZED no proactive refresh quando o token já foi rotacionado por outra thread")
    void shouldReturnAuthorizedInProactiveRefreshWhenAlreadyRotated() {
        String tokenString = "already-rotated";
        String accessToken = "valid-but-expiring-jwt";
        UserAuth user = new UserAuth();
        user.setActive(true);
        
        RefreshToken token = RefreshToken.builder()
                .token(tokenString)
                .userAgent("ua")
                .ipAddress("ip")
                .expiryDate(Instant.now().plusSeconds(100))
                .user(user)
                .build();

        // Simula que o Access Token é válido e está prestes a expirar
        when(jwtService.isTokenValid(accessToken)).thenReturn(true);
        when(jwtService.isTokenAboutToExpire(accessToken, 5)).thenReturn(true);
        
        // Simula que o Refresh Token ainda existe no banco
        when(refreshTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(token));
        
        // SIMULAÇÃO DA RACE CONDITION: Outra thread deletou o token entre o findByToken e o deleteByToken
        when(refreshTokenRepository.deleteByToken(tokenString)).thenReturn(0L);

        VerifyAuthResult result = refreshTokenService.verifyAuth(accessToken, tokenString, metadata);

        // Deve retornar AUTHORIZED (permitindo o uso do token atual) em vez de falhar
        assertEquals(VerifyAuthStatus.AUTHORIZED, result.status());
        verify(refreshTokenRepository).deleteByToken(tokenString);
    }

    @Test
    @DisplayName("Deve lançar BadRequestException no refreshToken quando o usuário vinculado ao token for nulo")
    void shouldThrowBadRequestInRefreshTokenWhenUserIsNull() {
        String tokenString = "token-without-user";
        RefreshToken token = RefreshToken.builder()
                .token(tokenString)
                .user(null)
                .expiryDate(Instant.now().plusSeconds(100))
                .build();

        when(refreshTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(token));

        assertThrows(BadRequestException.class, () -> 
            refreshTokenService.refreshToken(new com.auth.api.v1.dto.token.RefreshTokenRequestDto(tokenString))
        );
    }

    @Test
    @DisplayName("Deve retornar UNAUTHORIZED no verifyAuth quando o usuário vinculado ao token for nulo")
    void shouldReturnUnauthorizedInVerifyAuthWhenUserIsNull() {
        String tokenString = "token-without-user";
        RefreshToken token = RefreshToken.builder()
                .token(tokenString)
                .user(null)
                .expiryDate(Instant.now().plusSeconds(100))
                .build();

        when(refreshTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(token));

        VerifyAuthResult result = refreshTokenService.verifyAuth(null, tokenString, metadata);
        
        assertEquals(VerifyAuthStatus.UNAUTHORIZED, result.status());
    }
}
