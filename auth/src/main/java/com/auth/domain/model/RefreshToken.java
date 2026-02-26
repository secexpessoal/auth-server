/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import com.auth.infra.config.jpa.GeneratedUuidV7;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tb_refresh_token", schema = "auth")
public class RefreshToken {

    @Id
    @GeneratedUuidV7
    @Column(name = "col_token_id", updatable = false, nullable = false)
    private UUID tokenId;

    @OneToOne
    @JoinColumn(name = "col_user_id", referencedColumnName = "col_user_id")
    private User user;

    @Column(name = "ds_token", nullable = false, unique = true)
    private String token;

    @Column(name = "dt_expiry_date", nullable = false)
    private Instant expiryDate;
}
