/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.filter;

import com.auth.infra.exception.DataObjectError;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Value("${security.rate-limit.enabled:true}")
    private boolean enabled;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (enabled && (path.startsWith("/v1/user/login") || path.startsWith("/v1/user/register") || path.startsWith("/v1/password/reset"))) {
            String ip = getClientIP(request);
            Bucket bucket = resolveBucket(ip);

            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit excedido para o IP: {} na rota: {}", ip, path);
                sendRateLimitErrorResponse(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket resolveBucket(String ip) {
        return cache.computeIfAbsent(ip, this::createNewBucket);
    }

    private Bucket createNewBucket(String ip) {
        Bandwidth limit = Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofMinutes(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }

    private void sendRateLimitErrorResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        DataObjectError error = DataObjectError.builder()
                .message("Muitas tentativas de requisição. Por favor, aguarde alguns instantes e tente novamente.")
                .code(HttpStatus.TOO_MANY_REQUESTS.value())
                .timestamp(new Date())
                .build();
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }

        return xfHeader.split(",")[0];
    }
}
