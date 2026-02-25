/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.usecase;

import com.auth.data.model.User;
import com.auth.domain.http.dto.AuthenticationRequestDto;
import com.auth.domain.http.dto.AuthenticationResponseDto;
import com.auth.domain.http.dto.MetadataUserResponseDto;
import com.auth.domain.service.token.JwtGeneratorService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginUseCase {
    private final AuthenticationManager authManager;
    private final JwtGeneratorService jwtService;

    public AuthenticationResponseDto execute(AuthenticationRequestDto loginRequest) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.userName(), loginRequest.password())
        );

        User user = (User) auth.getPrincipal();

        String username = Optional.ofNullable(user).map(User::getUsername).orElse("");
        String role = Optional.ofNullable(user).map(it -> it.getRole().name()).orElse("");
        String jwt = jwtService.generateToken(user);

        MetadataUserResponseDto metadata = MetadataUserResponseDto.builder()
                .username(username)
                .role(role)
                .build();

        return AuthenticationResponseDto.builder()
                .token(jwt)
                .metadata(metadata)
                .build();
    }
}
