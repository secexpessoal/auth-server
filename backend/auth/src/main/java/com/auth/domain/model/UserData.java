/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "user_profiles", schema = "auth")
public class UserData {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @MapsId
    @OneToOne
    @JoinColumn(name = "user_id")
    private UserAuth user;

    @Column(name = "name", nullable = false, length = 255)
    private String userName;

    @Column(name = "registration", length = 6)
    @Size(min = 5, max = 6)
    private String registration;

    @Column(name = "position", length = 255)
    private String position;

    @Column(name = "birth_date")
    private Instant birthDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_regime")
    private WorkRegime workRegime;

    @Column(name = "is_living_elsewhere")
    private Boolean livesElsewhere;

    @Max(52)
    @Column(name = "frequency_cycle_weeks")
    private Integer frequencyCycleWeeks;

    @Max(127)
    @Column(name = "frequency_week_mask")
    private Integer frequencyWeekMask;

    @Max(365)
    @Column(name = "frequency_duration_days")
    private Integer frequencyDurationDays;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Força a atualização dos metadados de auditoria.
     * Útil para sincronizar a governança quando dados em outras tabelas (como UserAuth) mudam.
     */
    public void touch() {
        this.updatedAt = Instant.now();
    }
}
