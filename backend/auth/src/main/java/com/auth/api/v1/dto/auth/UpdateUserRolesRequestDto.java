/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v1.dto.auth;

import com.auth.domain.model.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.Set;

@Builder
public record UpdateUserRolesRequestDto(
        @NotNull(message = "A lista de cargos é obrigatória")
        @NotEmpty(message = "Selecione ao menos um cargo")
        @JsonProperty("roles")
        Set<Role> roles
) {
}
