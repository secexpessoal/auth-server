/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import com.auth.infra.security.service.UuidV7Service;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserAuth implements UserDetails {

    @Id
    private UUID userId = UuidV7Service.randomV7();

    @Email
    @Indexed(unique = true)
    @Field("email")
    private String email;

    @JsonIgnore
    @Field("password")
    private String password;

    @Field("role")
    private Set<Role> roles = new HashSet<>();

    @Field("is_active")
    private Boolean active = true;

    @Field("is_password_reset_required")
    private Boolean passwordResetRequired = false;

    @Field("token_version")
    private Integer tokenVersion = 0;

    @DocumentReference(lazy = true)
    private UserData userData;

    @NonNull
    @Override
    public String getUsername() {
        return this.userData != null ? this.userData.getUserName() : this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @NonNull
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(it -> new SimpleGrantedAuthority("ROLE_" + it.getRole())).collect(Collectors.toList());
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
        if (timestamp == 0) return Instant.now();
        return Instant.ofEpochMilli(timestamp);
    }

    public Integer getTokenVersion() {
        return tokenVersion == null ? 0 : tokenVersion;
    }
}
