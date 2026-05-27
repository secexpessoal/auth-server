/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.payload;

import lombok.Builder;

/**
 * Resultado da verificação e renovação de tokens no fluxo de Forward Auth.
 */
@Builder
public record VerifyAuthResult(
        VerifyAuthStatus status,
        String accessToken,
        String refreshToken
) {
}
