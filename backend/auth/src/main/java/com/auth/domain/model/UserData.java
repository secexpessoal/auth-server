/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import jakarta.persistence.*;
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
@Table(name = "tb_ds_user", schema = "auth")
public class UserData {

    @Id
    @Column(name = "col_user_id")
    private UUID userId;

    @MapsId
    @OneToOne
    @JoinColumn(name = "col_user_id")
    private UserAuth user;

    @Column(name = "ds_user_name", nullable = false, length = 255)
    private String userName;

    @Column(name = "ds_registration", length = 6)
    @Size(min = 5, max = 6)
    private String registration;

    @Column(name = "ds_position", length = 255)
    private String position;

    @Column(name = "dt_birth_date")
    private Instant birthDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "ds_work_regime")
    private WorkRegime workRegime;

    @Column(name = "bl_lives_elsewhere")
    private Boolean livesElsewhere;

    @Column(name = "dt_in_person_work_start")
    private Instant inPersonWorkStart;

    @Column(name = "dt_in_person_work_end")
    private Instant inPersonWorkEnd;

    @LastModifiedDate
    @Column(name = "dt_updated_at")
    private Instant updatedAt;

    @LastModifiedBy
    @Column(name = "ds_updated_by")
    private String updatedBy;

    /**
     * Força a atualização dos metadados de auditoria.
     * Útil para sincronizar a governança quando dados em outras tabelas (como UserAuth) mudam.
     */
    public void touch() {
        this.updatedAt = Instant.now();
    }
}
