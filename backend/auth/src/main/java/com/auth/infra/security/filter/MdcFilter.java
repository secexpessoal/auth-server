/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

import static com.auth.infra.config.MdcConfig.EMAIL_KEY;
import static com.auth.infra.config.MdcConfig.REQUEST_ID_KEY;

@Component
public class MdcFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            // NOTE: Adiciona um ID único para cada request para facilitar o rastreamento nos logs
            MDC.put(REQUEST_ID_KEY, UUID.randomUUID().toString());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                MDC.put(EMAIL_KEY, authentication.getName());
            }

            filterChain.doFilter(request, response);
        } finally {
            // IMPORTANTE: Limpar o MDC no final da request para não vazar dados para outras threads
            MDC.clear();
        }
    }
}
