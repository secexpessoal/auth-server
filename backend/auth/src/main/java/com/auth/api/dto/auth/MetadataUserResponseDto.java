/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record MetadataUserResponseDto(
        @JsonProperty("id") UUID id,
        @JsonProperty("username") String username,
        @JsonProperty("email") String email,
        @JsonProperty("role") String role,
        @JsonProperty("active")
        boolean active,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "America/Sao_Paulo")
        @JsonProperty("created_at")
        Instant createdAt,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "America/Sao_Paulo")
        @JsonProperty("updated_at")
        Instant updatedAt,

        @JsonProperty("updated_by")
        String updatedBy
) {
}
