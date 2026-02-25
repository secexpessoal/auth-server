/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.AuthenticationResponseDto;
import com.auth.api.dto.MetadataUserResponseDto;
import com.auth.api.dto.RegisterRequestDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserService userService;
    private final JwtGeneratorService jwtService;

    public AuthenticationResponseDto execute(RegisterRequestDto request, Role role) {
        User user = userService.userRegister(request, role);
        
        String jwt = jwtService.generateToken(user);

        String username = Optional.ofNullable(user).map(User::getUsername).orElse("");
        String userRole = Optional.ofNullable(user).map(u -> u.getRole().name()).orElse("");

        MetadataUserResponseDto metadata = MetadataUserResponseDto.builder()
                .username(username)
                .role(userRole)
                .build();

        return AuthenticationResponseDto.builder()
                .token(jwt)
                .metadata(metadata)
                .build();
    }
}
