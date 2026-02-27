/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import com.auth.infra.config.jpa.GeneratedUuidV7;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "tb_user", schema = "auth")
public class User implements UserDetails {

    @Id
    @GeneratedUuidV7
    @Column(name = "col_user_id", updatable = false, nullable = false)
    private UUID userId;

    @Column(name = "ds_user_name", nullable = false, length = 30)
    private String userName;

    @Email
    @Column(name = "ds_user_email", unique = true, nullable = false, length = 100)
    private String email;

    @JsonIgnore
    @Column(name = "ds_user_password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "ds_user_role")
    private Role role;

    @Column(name = "bl_active")
    private Boolean active = true;

    @Column(name = "bl_password_reset_required")
    private Boolean passwordResetRequired = false;

    @Column(name = "int_token_version")
    private Integer tokenVersion = 0;

    @LastModifiedDate
    @Column(name = "dt_updated_at")
    private Instant updatedAt;

    @NonNull
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.getRole()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @NonNull
    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    public boolean isPasswordResetRequired() {
        return passwordResetRequired != null && passwordResetRequired;
    }

    public Instant getCreatedAt() {
        if (userId == null) return null;
        long timestamp = userId.getMostSignificantBits() >>> 16;
        return Instant.ofEpochMilli(timestamp);
    }

    public Integer getTokenVersion() {
        return tokenVersion == null ? 0 : tokenVersion;
    }
}
