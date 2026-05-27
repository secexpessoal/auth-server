/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.v2.dto.auth;

import com.auth.domain.model.UserPositionEventType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record UserPositionHistoryResponseDto(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("userId")
        UUID userId,

        @JsonProperty("eventType")
        UserPositionEventType eventType,

        @JsonProperty("fromPositionId")
        UUID fromPositionId,

        @JsonProperty("fromPositionName")
        String fromPositionName,

        @JsonProperty("toPositionId")
        UUID toPositionId,

        @JsonProperty("toPositionName")
        String toPositionName,

        @JsonProperty("temporary")
        boolean temporary,

        @JsonProperty("plannedEndDate")
        Instant plannedEndDate,

        @JsonProperty("occurredAt")
        Instant occurredAt,

        @JsonProperty("changedBy")
        String changedBy,

        @JsonProperty("reason")
        String reason
) {
}
