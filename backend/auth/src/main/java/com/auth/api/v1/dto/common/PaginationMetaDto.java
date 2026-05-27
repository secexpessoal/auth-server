/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v1.dto.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record PaginationMetaDto(
        @JsonProperty("page") int page,
        @JsonProperty("limit") int limit,
        @JsonProperty("totalItems") long totalItems,
        @JsonProperty("totalPages") int totalPages,
        @JsonProperty("hasNext") boolean hasNext,
        @JsonProperty("hasPrevious") boolean hasPrevious
) {
}
