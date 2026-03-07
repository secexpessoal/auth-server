/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.filter;

import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitingFilterTest {

    private RateLimitingFilter rateLimitingFilter;

    @Mock
    private FilterChain filterChain;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        rateLimitingFilter = new RateLimitingFilter(objectMapper);
        org.springframework.test.util.ReflectionTestUtils.setField(rateLimitingFilter, "enabled", true);
    }

    @Test
    @DisplayName("Deve permitir requisições dentro do limite")
    void devePermitirDentroDoLimite() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/v1/user/login");
        request.setRemoteAddr("1.2.3.4");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitingFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Deve bloquear requisições que excedem o limite")
    void deveBloquearExcesso() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/v1/user/login");
        request.setRemoteAddr("1.2.3.5");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Consumir o limite (capacidade é 100 no código original)
        for (int i = 0; i < 100; i++) {
            rateLimitingFilter.doFilterInternal(request, new MockHttpServletResponse(), filterChain);
        }

        // 101ª requisição deve ser bloqueada
        rateLimitingFilter.doFilterInternal(request, response, filterChain);

        assertEquals(429, response.getStatus());
    }
}
