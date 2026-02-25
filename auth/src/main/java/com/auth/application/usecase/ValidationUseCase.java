/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.MetadataUserResponseDto;
import com.auth.domain.model.User;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ValidationUseCase {

    /**
     * Executa a lógica de extração de metadados do usuário autenticado de forma segura.
     *
     * @param authentication Objeto de autenticação populado pelo Spring Security
     * @return DTO com as informações do usuário
     */
    public MetadataUserResponseDto execute(Authentication authentication) {
        User user = (User) Optional.ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof User)
                .orElse(null);

        String username = Optional.ofNullable(user).map(User::getUsername).orElse("");
        String role = Optional.ofNullable(user).map(it -> it.getRole().name()).orElse("");

        return MetadataUserResponseDto.builder().username(username).role(role).build();
    }
}
