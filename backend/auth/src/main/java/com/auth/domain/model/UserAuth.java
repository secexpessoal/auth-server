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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
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

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @DocumentReference(lazy = true)
    @Field("user_profile")
    private UserData userProfile;

    @NonNull
    @Override
    public String getUsername() {
        UserData profile = getUserProfile();
        if (profile != null && profile.getUserName() != null) {
            return profile.getUserName();
        }

        return this.email != null
                ? this.email
                : "UNKNOWN_USER";
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @NonNull
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(role -> new SimpleGrantedAuthority("ROLE_" + role.getRole())).collect(Collectors.toList());
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
        return tokenVersion == null
                ? 0
                : tokenVersion;
    }

    /**
     * Atualiza os papéis (roles) do usuário.
     * Segue os princípios de DDD ao manter a lógica de alteração de estado dentro do modelo.
     */
    public void updateRoles(Set<Role> newRoles) {
        if (newRoles == null || newRoles.isEmpty()) {
            throw new IllegalArgumentException("O usuário deve possuir pelo menos uma Role");
        }
        this.roles.clear();
        this.roles.addAll(newRoles);
    }

    /**
     * Orquestra a atualização do perfil do usuário.
     */
    public void updateProfile(String name, String registration, Instant birthDate, WorkRegime regime, 
                              Boolean livesElsewhere, Integer cycleWeeks, Integer weekMask, Integer durationDays) {
        UserData profile = getProfileOrThrow();
        profile.updateBasicInfo(name, registration, birthDate, regime, livesElsewhere);
        profile.updateInPersonWorkPeriod(cycleWeeks, weekMask, durationDays);
        profile.touch();
    }

    /**
     * Atribui um cargo através do Aggregate Root.
     */
    public void assignPosition(UUID positionId, boolean temporary, Instant endDate) {
        getProfileOrThrow().assignPosition(positionId, temporary, endDate);
    }

    private UserData getProfileOrThrow() {
        UserData profile = getUserProfile();
        if (profile == null) {
            throw new IllegalStateException("O usuário não possui um perfil (UserProfile) vinculado. Operação cancelada.");
        }
        return profile;
    }
    }

