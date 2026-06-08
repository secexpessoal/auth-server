/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v2.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record PositionUpdateDto(
        @NotBlank(message = "O nome do cargo é obrigatório")
        @JsonProperty("name")
        String name,

        @JsonProperty("active")
        Boolean active
) {
}
