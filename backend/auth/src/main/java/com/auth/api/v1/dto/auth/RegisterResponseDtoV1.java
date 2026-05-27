/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v1.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

/**
 * DTO simplificado para a resposta de registro de usuário.
 */
@Builder
public record RegisterResponseDtoV1(
        @JsonProperty("email")
        String email,

        @JsonProperty("tempPassword")
        String tempPassword
) {
}
