/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.payload;

/**
 * Metadados da requisição de autenticação para validação e auditoria.
 */
public record AuthMetadata(
        String userAgent,
        String ipAddress,
        String origin,
        String referer
) {
}
