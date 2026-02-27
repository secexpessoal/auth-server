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
public record RegisterRequestDto(
        @Size(min = 3, max = 30, message = "O nome de usuário deve ter entre 3 e 30 caracteres")
        @NotBlank(message = "O nome de usuário não pode estar em branco")
        @JsonProperty("username")
        String userName,

        @Email(message = "O e-mail deve ser válido")
        @NotBlank(message = "O e-mail não pode estar em branco")
        @JsonProperty("email")
        String email
) {
}
