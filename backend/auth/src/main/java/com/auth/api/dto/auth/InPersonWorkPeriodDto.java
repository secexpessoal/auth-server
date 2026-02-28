/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Builder;

@Builder
public record InPersonWorkPeriodDto(
        @Min(1) @Max(52)
        @JsonProperty("frequencyCycleWeeks") Integer frequencyCycleWeeks,

        @Min(0) @Max(127)
        @JsonProperty("frequencyWeekMask") Integer frequencyWeekMask,

        @Min(1) @Max(365)
        @JsonProperty("frequencyDurationDays") Integer frequencyDurationDays
) {
}
