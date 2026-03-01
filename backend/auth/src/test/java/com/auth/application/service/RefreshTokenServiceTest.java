/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.RefreshTokenRepository;
import com.auth.infra.exception.custom.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @Test
    @DisplayName("Deve criar novo refresh token sem limpar os antigos de outras origens")
    void shouldCreateToken() {
        UserAuth user = new UserAuth();
        user.setEmail("tester@example.com");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        RefreshToken created = refreshTokenService.createRefreshToken(user, "Postman", "127.0.0.1", "https://app.itau.com.br", "https://app.itau.com.br/pix");

        assertNotNull(created);
        assertEquals("Postman", created.getUserAgent());
        assertEquals("127.0.0.1", created.getIpAddress());
        assertEquals("https://app.itau.com.br", created.getOrigin());
        assertEquals(1, created.getVersion());
        verify(refreshTokenRepository, never()).deleteByUser(user);
    }

    @Test
    @DisplayName("Deve reaproveitar e incrementar versão se for da mesma origem granular")
    void shouldReuseTokenForSameOrigin() {
        UserAuth user = new UserAuth();
        RefreshToken existing = RefreshToken.builder()
                .user(user)
                .userAgent("Postman")
                .ipAddress("127.0.0.1")
                .origin("https://app.itau.com.br")
                .referer("https://app.itau.com.br/pix")
                .version(1)
                .token("old-token")
                .build();

        when(refreshTokenRepository.findByUserAndUserAgentAndIpAddressAndOriginAndReferer(
                any(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Optional.of(existing));
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        RefreshToken updated = refreshTokenService.createRefreshToken(user, "Postman", "127.0.0.1", "https://app.itau.com.br", "https://app.itau.com.br/pix");

        assertNotEquals("old-token", updated.getToken());
        assertEquals(2, updated.getVersion());
        verify(refreshTokenRepository).save(existing);
    }

    @Test
    @DisplayName("Deve lançar exceção se o token estiver expirado")
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
}
