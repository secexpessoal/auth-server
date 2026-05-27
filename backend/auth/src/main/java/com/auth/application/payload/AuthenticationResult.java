/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.payload;

import com.auth.domain.model.UserAuth;
import lombok.Builder;

/**
 * Resultado interno do processo de autenticação.
 * Transporta os dados do usuário e tokens sem depender de DTOs da API.
 */
@Builder
public record AuthenticationResult(
        UserAuth user,
        String accessToken,
        String refreshToken,
        Integer tokenVersion,
        boolean passwordResetRequired,
        String redirectUri
) {
}
