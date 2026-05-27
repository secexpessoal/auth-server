/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v2.dto.common;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO universal para expor metadados de Enums para o frontend.
 */
public record EnumTypeResponseDto(
        @JsonProperty("value")
        String value,

        @JsonProperty("label")
        String label,

        @JsonProperty("description")
        String description
) {
}
