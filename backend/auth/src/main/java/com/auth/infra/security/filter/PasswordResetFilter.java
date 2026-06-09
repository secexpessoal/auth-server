/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.filter;

import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import org.springframework.util.AntPathMatcher;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que impede o acesso a qualquer recurso (exceto logout e troca de senha)
 * caso o usuário tenha a flag passwordResetRequired ativa.
 */
public class PasswordResetFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper()
            .setTimeZone(java.util.TimeZone.getTimeZone("America/Sao_Paulo"));
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final List<String> ALLOWED_PATTERNS = List.of(
            "/v*/password/first-change",
            "/v*/user/logout",
            "/v*/user/refresh",
            "/v*/password/user-reset"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() &&
            authentication.getPrincipal() instanceof UserAuth user) {
            String path = request.getRequestURI();

            boolean isAllowedPath = ALLOWED_PATTERNS.stream()
                    .anyMatch(pattern -> pathMatcher.match(pattern, path));

            if (user.isPasswordResetRequired() && !isAllowedPath) {
                sendErrorResponse(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response) throws IOException {
        response.setStatus(ErrorCode.PASSWORD_RESET_REQUIRED.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        PasswordResetErrorResponse body = new PasswordResetErrorResponse(
                "PASSWORD_RESET_REQUIRED",
                ErrorCode.PASSWORD_RESET_REQUIRED.getMessage(),
                ErrorCode.PASSWORD_RESET_REQUIRED.getHttpStatus().value()
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private record PasswordResetErrorResponse(String error, String message, int status) {
    }
}
