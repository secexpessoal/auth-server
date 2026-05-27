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

import java.util.List;
import java.util.Map;

@Builder
public record PaginatedResponseDto<T>(
        @JsonProperty("data") List<T> data,
        @JsonProperty("meta") Map<String, PaginationMetaDto> meta,
        @JsonProperty("links") Map<String, String> links
) {
}
