/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import com.auth.infra.security.service.UuidV7Service;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_profiles")
public class UserData {

    @Id
    private UUID userId = UuidV7Service.randomV7();

    @DocumentReference(lazy = true)
    private UserAuth user;

    @Field("name")
    private String userName;

    @Size(min = 5, max = 6)
    @Field("registration")
    private String registration;

    @Field("position")
    private String position;

    @Field("birth_date")
    private Instant birthDate;

    @Field("work_regime")
    private WorkRegime workRegime;

    @Field("is_living_elsewhere")
    private Boolean livesElsewhere;

    @Max(52)
    @Field("frequency_cycle_weeks")
    private Integer frequencyCycleWeeks;

    @Max(127)
    @Field("frequency_week_mask")
    private Integer frequencyWeekMask;

    @Max(365)
    @Field("frequency_duration_days")
    private Integer frequencyDurationDays;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;

    @LastModifiedBy
    @Field("updated_by")
    private String updatedBy;

    public void touch() {
        this.updatedAt = Instant.now();
    }
}
