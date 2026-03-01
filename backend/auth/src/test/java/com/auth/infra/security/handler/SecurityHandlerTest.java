/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class SecurityHandlerTest {

    private CustomAccessDeniedHandler accessDeniedHandler;
    private CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        accessDeniedHandler = new CustomAccessDeniedHandler(objectMapper);
        authenticationEntryPoint = new CustomAuthenticationEntryPoint(objectMapper);
    }

    @Test
    @DisplayName("CustomAccessDeniedHandler deve retornar 403 e mensagem de erro")
    void accessDeniedShouldReturn403() throws IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        AccessDeniedException exception = new AccessDeniedException("Denied");

        accessDeniedHandler.handle(request, response, exception);

        assertEquals(403, response.getStatus());
        assertEquals("application/json", response.getContentType());
    }

    @Test
    @DisplayName("CustomAuthenticationEntryPoint deve retornar 401 e mensagem de erro")
    void authEntryPointShouldReturn401() throws IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        AuthenticationException exception = new AuthenticationException("Unauthorized") {};

        authenticationEntryPoint.commence(request, response, exception);

        assertEquals(401, response.getStatus());
        assertEquals("application/json", response.getContentType());
    }
}
