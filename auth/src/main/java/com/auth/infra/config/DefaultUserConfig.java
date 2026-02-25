/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.config;

import com.auth.data.model.User;
import com.auth.data.repository.UserRepository;
import com.auth.domain.http.dto.RegisterRequestDto;
import com.auth.domain.service.user.UserService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DefaultUserConfig {
    @Value("${admin.name}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner commandLineRunner(UserRepository userRepository, UserService userService) {
        return args -> {
            if (userRepository.findByUserName(adminUsername).isEmpty()) {
                User admin = new User();

                admin.setUserName(adminUsername);
                admin.setPassword(adminPassword);
                admin.setRole(ServerSecurityConfig.Role.ADMIN);

                RegisterRequestDto registerRequestDTO = new RegisterRequestDto(admin.getUsername(), admin.getPassword(), admin.getRole());
                userService.userRegister(registerRequestDTO);
            }
        };
    }
}
