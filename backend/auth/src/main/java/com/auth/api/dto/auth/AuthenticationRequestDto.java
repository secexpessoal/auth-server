/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record AuthenticationRequestDto(
        @NotBlank(message = "O e-mail não pode estar em branco")
        @Email(message = "O e-mail deve ser válido")
        @JsonProperty("email")
        String email,

        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        @NotBlank(message = "A senha não pode estar em branco")
        String password
) {
}
