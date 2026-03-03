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
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.security.web.firewall.RequestRejectedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomRequestRejectedHandler implements RequestRejectedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, RequestRejectedException requestRejectedException) throws IOException {
        String ip = getClientIP(request);
        String uri = request.getRequestURI();

        // NOTE: Loga de forma limpa, sem expor o stack trace para o stdout/file e evitar overhead e lentidão por spam
        log.warn("Rejected malformed request - IP: {} - URI: {}", ip, uri != null ? uri : "Unknown path");

        boolean isApiRoute = uri != null && uri.startsWith("/v1/");

        if (!isApiRoute) {
            response.sendRedirect("/?error_code=400");
            return;
        }

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

        String traceId = MDC.get("traceId");
        if (traceId == null) {
            traceId = UUID.randomUUID().toString(); // Fallback in case MDC isn't populated for some reason
        }

        DataObjectError error = DataObjectError.builder()
                .timestamp(new Date())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .code("MALFORMED_URL")
                .message("A requisição HTTP enviada é inválida ou possui caracteres bloqueados.")
                .path(uri != null ? uri : "Unknown path")
                .traceId(traceId)
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(error));
        response.getWriter().flush();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
