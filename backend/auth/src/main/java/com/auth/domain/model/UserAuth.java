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
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
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
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "tb_auth", schema = "auth")
public class UserAuth implements UserDetails {

    @Id
    @GeneratedUuidV7
    @Column(name = "col_user_id", updatable = false, nullable = false)
    private UUID userId;

    @Email
    @Column(name = "ds_user_email", unique = true, nullable = false, length = 100)
    private String email;

    @JsonIgnore
    @Column(name = "ds_user_password", nullable = false)
    private String password;

    @Column(name = "ds_role")
    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tb_user_roles", schema = "auth", joinColumns = @JoinColumn(name = "col_user_id"))
    private Set<Role> roles = new HashSet<>();

    @Column(name = "bl_active")
    private Boolean active = true;

    @Column(name = "bl_password_reset_required")
    private Boolean passwordResetRequired = false;

    @Column(name = "int_token_version")
    private Integer tokenVersion = 0;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @PrimaryKeyJoinColumn
    private UserData userData;

    /**
     * Retorna o identificador do usuário para o Spring Security.
     * Prioriza o userName definido no perfil (UserData), funcionando como fallback para o e-mail.
     *
     * @return O nome de usuário do perfil ou o e-mail se o perfil não estiver carregado.
     */
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
        return Instant.ofEpochMilli(timestamp);
    }

    public Integer getTokenVersion() {
        return tokenVersion == null ? 0 : tokenVersion;
    }

    /**
     * Sincroniza a governança com a tabela de perfil.
     * Garante que mudanças em dados de autenticação (senha, roles, status) sejam 
     * refletidas no log de auditoria centralizado do UserData.
     */
    @PreUpdate
    @PrePersist
    public void syncGovernance() {
        if (this.userData != null) {
            this.userData.touch();
        }
    }
}
