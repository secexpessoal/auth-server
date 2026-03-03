/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.domain.repository.RefreshTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TokenCleanupServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private TokenCleanupService tokenCleanupService;

    @Test
    @DisplayName("Deve chamar a limpeza de tokens expirados com sucesso")
    void deveLimparTokensExpiradosComSucesso() {
        // Act
        tokenCleanupService.cleanupExpiredTokens();

        // Assert
        verify(refreshTokenRepository).deleteByExpiryDateBefore(any(Instant.class));
    }

    @Test
    @DisplayName("Deve lidar com exceção ao limpar tokens sem propagar o erro")
    void deveLidarComExcecaoNaLimpeza() {
        // Arrange
        doThrow(new RuntimeException("Database error")).when(refreshTokenRepository).deleteByExpiryDateBefore(any(Instant.class));

        // Act
        tokenCleanupService.cleanupExpiredTokens();

        // Assert
        verify(refreshTokenRepository).deleteByExpiryDateBefore(any(Instant.class));
        // O teste passa se nenhuma exceção for lançada pelo cleanupExpiredTokens
    }
}
