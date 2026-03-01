/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.service;

import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class JwtGeneratorServiceTest {

    private JwtGeneratorService jwtGeneratorService;
    private final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"; // 256-bit key

    @BeforeEach
    void setUp() {
        jwtGeneratorService = new JwtGeneratorService();
        ReflectionTestUtils.setField(jwtGeneratorService, "secretKey", SECRET);
        ReflectionTestUtils.setField(jwtGeneratorService, "jwtExpiration", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Deve gerar um token JWT válido")
    void deveGerarTokenValido() {
        UserAuth user = new UserAuth();
        user.setEmail("test@example.com");
        user.setTokenVersion(1);

        String token = jwtGeneratorService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("Deve extrair o email do token corretamente")
    void deveExtrairEmail() {
        UserAuth user = new UserAuth();
        user.setEmail("test@example.com");
        user.setTokenVersion(1);

        String token = jwtGeneratorService.generateToken(user);
        String email = jwtGeneratorService.extractEmail(token);

        assertEquals("test@example.com", email);
    }

    @Test
    @DisplayName("Deve validar token corretamente")
    void deveValidarToken() {
        UserAuth user = new UserAuth();
        user.setEmail("test@example.com");
        user.setTokenVersion(1);

        String token = jwtGeneratorService.generateToken(user);
        
        assertTrue(jwtGeneratorService.isTokenValid(token, user));
    }

    @Test
    @DisplayName("Deve invalidar token se a versão for diferente")
    void deveInvalidarTokenComVersaoDiferente() {
        UserAuth user = new UserAuth();
        user.setEmail("test@example.com");
        user.setTokenVersion(1);

        String token = jwtGeneratorService.generateToken(user);
        
        user.setTokenVersion(2); // Muda versão no objeto de comparação
        
        assertFalse(jwtGeneratorService.isTokenValid(token, user));
    }
}
