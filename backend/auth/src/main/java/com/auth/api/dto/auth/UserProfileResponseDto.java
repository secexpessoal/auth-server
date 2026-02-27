/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.auth;

import com.auth.domain.model.WorkRegime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.time.Instant;

@Builder
public record UserProfileResponseDto(
        @JsonProperty("username") String username,
        @JsonProperty("registration") String registration,
        @JsonProperty("position") String position,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
        @JsonProperty("birth_date") Instant birthDate,

        @JsonProperty("work_regime") WorkRegime workRegime,
        @JsonProperty("lives_elsewhere") boolean livesElsewhere,
        @JsonProperty("in_person_work_period") InPersonWorkPeriodDto inPersonWorkPeriod
) {
}
