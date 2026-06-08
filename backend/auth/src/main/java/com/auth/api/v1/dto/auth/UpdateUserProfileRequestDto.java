/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v1.dto.auth;

import com.auth.domain.model.WorkRegime;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.Instant;

@Builder
public record UpdateUserProfileRequestDto(
        @Size(min = 3, max = 100, message = "O nome do usuário deve ter entre 3 e 100 caracteres")
        @NotBlank(message = "O nome do usuário é obrigatório")
        @JsonProperty("username")
        String username,

        @NotBlank(message = "O cargo é obrigatório")
        @JsonProperty("position")
        String position,

        @JsonProperty("birthDate")
        Instant birthDate,

        @Size(min = 5, max = 6, message = "A matrícula deve ter entre 5 e 6 caracteres")
        @NotBlank(message = "A matrícula é obrigatória")
        @JsonProperty("registration")
        String registration,

        @NotNull(message = "O regime de trabalho é obrigatório")
        @JsonProperty("workRegime")
        WorkRegime workRegime,

        @JsonProperty("livesElsewhere")
        Boolean livesElsewhere,

        @Valid
        @JsonProperty("inPersonWorkPeriod")
        InPersonWorkPeriodDto inPersonWorkPeriod
) {
}
