/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import com.auth.infra.security.service.UuidV7Service;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_position_history")
public class UserPositionHistory {

    @Id
    @Builder.Default
    private UUID id = UuidV7Service.randomV7();

    @Field("user_id")
    private UUID userId;

    @Field("position_id")
    private UUID positionId;

    @Field("position_name")
    private String positionName;

    @Field("start_date")
    private Instant startDate;

    @Field("end_date")
    private Instant endDate;

    @Field("changed_by")
    private String changedBy;

    @Field("reason")
    private String reason; // Ex: "Pessoa X entrou de férias e pessoa Y vai entrar em seu lugar temporariamente"
}
