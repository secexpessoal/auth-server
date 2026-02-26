/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record AuthenticationResponseDto(
        @JsonProperty("token") String token, 
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("password_reset_required") boolean passwordResetRequired,
        @JsonProperty("metadata") MetadataUserResponseDto metadata
) {
}
