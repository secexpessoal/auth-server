/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.config;

import com.auth.domain.model.UserAuth;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Configuração de Auditoria do JPA.
 * Captura o usuário logado para preencher campos como @LastModifiedBy.
 */
@Configuration
@EnableMongoAuditing(auditorAwareRef = "auditorProvider")
public class AuditConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() || 
                authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
                return Optional.empty();
            }

            // Mesmo que getUsername() retorne o nome de exibição, no AuditorAware prefere-se o identificador único (E-mail).
            if (authentication.getPrincipal() instanceof UserAuth user) {
                return Optional.ofNullable(user.getEmail());
            }

            return Optional.ofNullable(authentication.getName());
        };
    }
}
