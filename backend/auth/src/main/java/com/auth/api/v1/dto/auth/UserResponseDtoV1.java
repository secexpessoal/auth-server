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

import java.util.Set;
import java.util.UUID;

@Builder
public record UserResponseDtoV1(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("email")
        String email,

        @JsonProperty("active")
        boolean active,

        @JsonProperty("roles")
        Set<String> roles,

        @JsonProperty("profile")
        UserProfileResponseDto profile,

        @JsonProperty("audit")
        UserAuditResponseDto audit,

        @JsonProperty("tempPassword")
        String tempPassword
) {
}
