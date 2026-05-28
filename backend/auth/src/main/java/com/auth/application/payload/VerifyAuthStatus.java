/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.payload;

/**
 * Status do resultado da verificação de Forward Auth.
 */
public enum VerifyAuthStatus {
    /**
     * Sessão válida e ativa.
     */
    AUTHORIZED,

    /**
     * Sessão renovada silenciosamente (novos tokens gerados).
     */
    RENEWED,

    /**
     * Sessão inválida ou expirada, requer redirecionamento para login.
     */
    UNAUTHORIZED
}
