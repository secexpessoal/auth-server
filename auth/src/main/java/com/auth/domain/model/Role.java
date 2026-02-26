/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import lombok.Getter;

/**
 * Define os papéis (roles) de autoridade dentro do sistema.
 * Utilizado para controle de acesso (RBAC - Role Based Access Control).
 */
@Getter
public enum Role {
    /** Cargo com permissões totais, incluindo reset de senhas e criação de outros admins. */
    ADMIN("ADMIN"),
    
    /** Cargo de usuário padrão, com acesso limitado às suas próprias informações. */
    USER("USER");

    private final String role;

    Role(String role) {
        this.role = role;
    }
}
