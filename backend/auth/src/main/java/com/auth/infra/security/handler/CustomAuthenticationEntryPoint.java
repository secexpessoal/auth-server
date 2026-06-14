/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.handler;

import com.auth.infra.exception.DataObjectError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.jspecify.annotations.NonNull;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

import static com.auth.infra.config.MdcConfig.REQUEST_ID_KEY;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull AuthenticationException authenticationException) throws IOException {
        String acceptHeader = request.getHeader("Accept");
        String xRequestedWith = request.getHeader("X-Requested-With");
        String forwardedUri = request.getHeader("X-Forwarded-Uri");

        // 1. Se for Forward Auth (SSO via Proxy), o browser precisa do redirect (302) para o login
        if (forwardedUri != null || (request.getRequestURI() != null && request.getRequestURI().contains("/auth/verify"))) {
            response.sendRedirect("/login");
            return;
        }

        // 2. Se a requisição espera JSON (Axios, Mobile, AJAX), sinalizamos o erro 401.
        // O Spring Security irá delegar para o mecanismo de erro padrão (CustomErrorController)
        // evitando duplicidade de body escrita manualmente.
        boolean prefersJson = (acceptHeader != null && acceptHeader.contains(MediaType.APPLICATION_JSON_VALUE))
                || "XMLHttpRequest".equals(xRequestedWith);

        if (prefersJson) {
            writeErrorResponse(request, response);
            return;
        }

        // 3. Fallback para navegação direta via browser: Redirect (302)
        response.sendRedirect("/login");
    }

    private void writeErrorResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpStatus status = HttpStatus.UNAUTHORIZED;

        DataObjectError error = DataObjectError.builder()
                .timestamp(new Date())
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(status.name())
                .message("Acesso não autorizado ou sessão expirada.")
                .path(request.getRequestURI())
                .traceId(MDC.get(REQUEST_ID_KEY))
                .build();

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(error));
        response.flushBuffer();
    }
}

