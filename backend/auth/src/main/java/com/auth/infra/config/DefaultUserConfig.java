/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.config;

import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import com.auth.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DefaultUserConfig {
    @Value("${admin.name}")
    private String adminUsername;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner commandLineRunner(UserRepository userRepository, UserService userService) {
        return args -> {
            // Verifica se o admin já existe para evitar duplicidade
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                RegisterRequestDto registerRequestDTO = new RegisterRequestDto(
                        adminUsername, adminEmail);

                userService.userRegister(registerRequestDTO, Role.ADMIN, adminPassword);
            }
        };
    }
}
