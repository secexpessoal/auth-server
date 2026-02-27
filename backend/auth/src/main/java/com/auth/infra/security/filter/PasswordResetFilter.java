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
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Filtro que impede o acesso a qualquer recurso (exceto logout e troca de senha)
 * caso o usuário tenha a flag passwordResetRequired ativa.
 */
public class PasswordResetFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() &&
            authentication.getPrincipal() instanceof UserAuth user) {
            String path = request.getRequestURI();

            // Permitir apenas logout, troca de senha e primeira troca
            boolean isAllowedPath = path.equals("/v1/password/first-change") || path.equals("/v1/user/logout") ||
                                    path.equals("/v1/user/refresh");

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

        Map<String, Object> body = Map.of(
                "error", "PASSWORD_RESET_REQUIRED",
                "message", ErrorCode.PASSWORD_RESET_REQUIRED.getMessage(),
                "status", ErrorCode.PASSWORD_RESET_REQUIRED.getHttpStatus().value()
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
