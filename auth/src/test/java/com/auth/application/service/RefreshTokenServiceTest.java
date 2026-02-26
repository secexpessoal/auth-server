/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.User;
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
    @DisplayName("Deve criar novo refresh token limpando os antigos")
    void shouldCreateToken() {
        User user = new User();
        user.setUserName("tester");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        RefreshToken created = refreshTokenService.createRefreshToken(user);

        assertNotNull(created);
        assertNotNull(created.getToken());
        verify(refreshTokenRepository).deleteByUser(user);
        verify(refreshTokenRepository).save(any());
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
