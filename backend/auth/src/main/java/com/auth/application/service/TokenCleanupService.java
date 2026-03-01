/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.domain.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Limpa tokens expirados do banco de dados.
     * Executa todos os dias à meia-noite.
     */
    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupExpiredTokens() {
        log.info("Iniciando limpeza de tokens expirados...");
        try {
            refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());
            log.info("Limpeza de tokens expirados concluída com sucesso.");
        } catch (Exception exception) {
            log.error("Erro ao limpar tokens expirados: {}", exception.getMessage());
        }
    }
}
