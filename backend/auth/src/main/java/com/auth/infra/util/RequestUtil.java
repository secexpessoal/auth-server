/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.experimental.UtilityClass;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.util.Optional;

@UtilityClass
public class RequestUtil {

    /**
     * Extrai o IP real do cliente.
     * Como server.forward-headers-strategy=native está ativado, o Spring/Tomcat 
     * já processou o X-Forwarded-For e o remoteAddr já contém o IP real.
     */
    public static String getClientIP(HttpServletRequest request) {
        return request != null ? request.getRemoteAddr() : "unknown";
    }

    /**
     * Obtém o HttpServletRequest atual do contexto do Spring de forma segura.
     */
    public static Optional<HttpServletRequest> getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return Optional.ofNullable(attributes).map(ServletRequestAttributes::getRequest);
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }
}

