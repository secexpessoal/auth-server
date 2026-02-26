/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.password;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record FirstChangePasswordRequestDto(
        @NotBlank(message = "A nova senha não pode estar em branco")
        @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
        @JsonProperty("new_password")
        String newPassword
) {
}
