/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.filter;

import com.auth.domain.model.UserAuth;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetFilterTest {

    private PasswordResetFilter passwordResetFilter;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        passwordResetFilter = new PasswordResetFilter();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Deve bloquear acesso se reset de senha for obrigatório")
    void deveBloquearSeResetObrigatorio() throws ServletException, IOException {
        // Arrange
        UserAuth user = new UserAuth();
        user.setEmail("admin@example.com");
        user.setPasswordResetRequired(true);
        
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList())
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/v1/some-secure-endpoint");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        passwordResetFilter.doFilterInternal(request, response, filterChain);

        // Assert
        assertEquals(403, response.getStatus());
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("Deve permitir acesso a endpoints liberados mesmo com reset obrigatório")
    void devePermitirEndpointsLiberados() throws ServletException, IOException {
        // Arrange
        UserAuth user = new UserAuth();
        user.setEmail("admin@example.com");
        user.setPasswordResetRequired(true);
        
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList())
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/v1/password/first-change");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        passwordResetFilter.doFilterInternal(request, response, filterChain);

        // Assert
        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }
}
