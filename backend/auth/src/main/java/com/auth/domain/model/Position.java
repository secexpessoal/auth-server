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
@Document(collection = "positions")
public class Position {

    @Id
    @Builder.Default
    private UUID id = UuidV7Service.randomV7();

    @Field("name")
    private String name;

    @Field("is_active")
    @Builder.Default
    private boolean active = true;

    @Field("created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
