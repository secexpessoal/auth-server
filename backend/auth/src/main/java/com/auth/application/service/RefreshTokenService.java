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
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.refresh-expiration-time:604800000}") // Default: 7 dias em ms
    private long refreshTokenExpiration;


    public RefreshToken createRefreshToken(UserAuth user, String userAgent, String ipAddress, String origin, String referer) {
        List<RefreshToken> existingTokens = refreshTokenRepository
                .findByUserAndUserAgentAndIpAddressAndOriginAndReferer(user, userAgent, ipAddress, origin, referer);

        if (existingTokens.size() > 1) {
            existingTokens.sort(Comparator.comparing(RefreshToken::getExpiryDate).reversed());
            List<RefreshToken> toDelete = existingTokens.subList(1, existingTokens.size());
            refreshTokenRepository.deleteAll(toDelete);
            
            // Mantém apenas o mais recente na lista para reaproveitamento
            RefreshToken newest = existingTokens.get(0);
            existingTokens.clear();
            existingTokens.add(newest);
        }

        RefreshToken refreshToken = existingTokens.stream()
                .findFirst()
                .orElseGet(() -> RefreshToken.builder()
                        .user(user)
                        .userAgent(userAgent)
                        .ipAddress(ipAddress)
                        .origin(origin)
                        .referer(referer)
                        .version(0)
                        .build());

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpiration));
        refreshToken.setVersion(refreshToken.getVersion() + 1);

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Refresh token expirado. Por favor, faça login novamente.");
        }
        return token;
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException(ErrorCode.UNAUTHORIZED, "Refresh token inválido ou não encontrado."));
    }


    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }


    public void deleteByUser(UserAuth user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
