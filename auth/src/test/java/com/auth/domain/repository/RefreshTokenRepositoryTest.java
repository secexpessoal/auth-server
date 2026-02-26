/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.repository;

import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RefreshTokenRepositoryTest {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Deve salvar e buscar refresh token")
    void shouldSaveAndFindByToken() {
        User user = new User();
        user.setUserName("token-owner");
        user.setEmail("owner@example.com");
        user.setPassword("pass");
        user.setRole(Role.USER);
        userRepository.saveAndFlush(user);

        RefreshToken token = RefreshToken.builder()
                .token("my-unique-token")
                .user(user)
                .expiryDate(Instant.now().plusSeconds(3600))
                .build();
        refreshTokenRepository.saveAndFlush(token);

        Optional<RefreshToken> found = refreshTokenRepository.findByToken("my-unique-token");

        assertTrue(found.isPresent());
        assertEquals("owner@example.com", found.get().getUser().getUsername());
    }

    @Test
    @DisplayName("Deve deletar tokens por usuário")
    void shouldDeleteByUser() {
        User user = new User();
        user.setUserName("deleted-owner");
        user.setEmail("deleted@example.com");
        user.setPassword("pass");
        user.setRole(Role.USER);
        userRepository.saveAndFlush(user);

        RefreshToken token = RefreshToken.builder()
                .token("delete-me")
                .user(user)
                .expiryDate(Instant.now().plusSeconds(3600))
                .build();
        refreshTokenRepository.saveAndFlush(token);

        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();

        Optional<RefreshToken> found = refreshTokenRepository.findByToken("delete-me");
        assertTrue(found.isEmpty());
    }
}
