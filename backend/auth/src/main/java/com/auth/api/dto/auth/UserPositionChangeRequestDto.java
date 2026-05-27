/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.dto.auth;

import com.auth.domain.model.UserPositionEventType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record UserPositionChangeRequestDto(
    @NotNull(message = "O ID do cargo é obrigatório")
    @JsonProperty("positionId")
    UUID positionId,

    @NotNull(message = "O tipo de evento é obrigatório")
    @JsonProperty("eventType")
    UserPositionEventType eventType,

    @JsonProperty("isTemporary")
    boolean temporary,

    @JsonProperty("endDate")
    Instant endDate,

    @JsonProperty("reason")
    String reason
) {
}
