/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

import com.auth.api.dto.AuthenticationRequestDto;
import com.auth.api.dto.AuthenticationResponseDto;
import com.auth.api.dto.RegisterRequestDto;
import com.auth.application.service.UserService;
import com.auth.application.usecase.LoginUseCase;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController()
@RequiredArgsConstructor
@RequestMapping("/v1/user")
public class AuthController {
    private final LoginUseCase loginUseCase;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDto> login(@Valid @RequestBody AuthenticationRequestDto loginRequest) {
        try {
            AuthenticationResponseDto response = loginUseCase.execute(loginRequest);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponseDto> register(@Valid @RequestBody RegisterRequestDto registerRequest) {
        AuthenticationResponseDto response = userService.userRegister(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
