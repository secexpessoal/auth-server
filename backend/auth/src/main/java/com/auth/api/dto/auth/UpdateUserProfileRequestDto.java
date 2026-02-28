/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.auth;

import com.auth.domain.model.WorkRegime;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.Instant;

@Builder
public record UpdateUserProfileRequestDto(
        @Size(min = 3, max = 100)
        @JsonProperty("username") String username,

        @Size(min = 5, max = 6)
        @JsonProperty("position") String position,

        @JsonProperty("birth_date") Instant birthDate,

        @JsonProperty("registration") String registration,

        @JsonProperty("work_regime") WorkRegime workRegime,

        @JsonProperty("lives_elsewhere") Boolean livesElsewhere,

        @JsonProperty("in_person_work_period") InPersonWorkPeriodDto inPersonWorkPeriod
) {
}
