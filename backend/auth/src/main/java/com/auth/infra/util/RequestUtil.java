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

@UtilityClass
public class RequestUtil {

    /**
     * Extrai o IP real do cliente.
     * Como server.forward-headers-strategy=native está ativado, o Spring/Tomcat 
     * já processou o X-Forwarded-For e o remoteAddr já contém o IP real.
     */
    public static String getClientIP(HttpServletRequest request) {
        return request.getRemoteAddr();
    }
}

