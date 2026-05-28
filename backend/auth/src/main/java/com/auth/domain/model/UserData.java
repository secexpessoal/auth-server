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
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
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

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @DocumentReference(lazy = true)
    private UserAuth user;

    @Field("name")
    private String userName;

    @Size(min = 5, max = 6)
    @Field("registration")
    private String registration;

    @Field("current_position")
    private UserPositionAssignment currentPosition;

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

    /**
     * Atualiza os dados básicos do perfil.
     */
    public void updateBasicInfo(String name, String registration, Instant birthDate, WorkRegime regime, Boolean livesElsewhere) {
        this.userName = name;
        this.registration = registration;
        this.birthDate = birthDate;
        this.workRegime = regime;
        this.livesElsewhere = livesElsewhere;
    }

    /**
     * Atualiza as regras de trabalho presencial.
     */
    public void updateInPersonWorkPeriod(Integer cycleWeeks, Integer weekMask, Integer durationDays) {
        Integer duration = calculateDuration(weekMask, durationDays);

        this.frequencyCycleWeeks = cycleWeeks != null
                ? cycleWeeks
                : 1;
        this.frequencyWeekMask = duration != null
                ? 0
                : (weekMask != null
                        ? weekMask
                        : 0);
        this.frequencyDurationDays = duration;
    }

    private Integer calculateDuration(Integer mask, Integer requestedDuration) {
        if (mask != null && mask > 0 && requestedDuration != null) {
            return null;
        }

        if (requestedDuration != null && requestedDuration > 365) {
            throw new IllegalArgumentException("A duração consecutiva não pode ultrapassar 365 dias");
        }

        return requestedDuration;
    }

    /**
     * Atribui um novo cargo ao usuário.
     */
    public void assignPosition(UUID positionId, boolean temporary, Instant endDate) {
        UUID previousId = null;
        if (temporary && this.currentPosition != null) {
            previousId = this.currentPosition.getPositionId();
        }

        this.currentPosition = UserPositionAssignment.builder()
                .positionId(positionId)
                .temporary(temporary)
                .startDate(Instant.now())
                .endDate(endDate)
                .previousPositionId(previousId != null
                        ? previousId
                        : (this.currentPosition != null
                                ? this.currentPosition.getPreviousPositionId()
                                : null))
                .build();
        this.touch();
    }

    /**
     * Classe interna para representar a atribuição de cargo atual do usuário.
     * Define a estrutura embarcada (embedded) no MongoDB.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPositionAssignment {

        @Field("position_id")
        private UUID positionId;

        @Field("is_temporary")
        private boolean temporary;

        @Field("start_date")
        private Instant startDate;

        @Field("end_date")
        private Instant endDate;

        @Field("previous_position_id")
        private UUID previousPositionId;
    }
}
