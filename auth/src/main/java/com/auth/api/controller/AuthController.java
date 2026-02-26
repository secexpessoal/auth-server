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
import com.auth.api.dto.MetadataUserResponseDto;
import com.auth.application.usecase.LoginUseCase;
import com.auth.application.usecase.ValidationUseCase;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/user")
public class AuthController {

    private final LoginUseCase loginUseCase;
    private final ValidationUseCase validationUseCase;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDto> login(@Valid @RequestBody AuthenticationRequestDto loginRequest) {
        AuthenticationResponseDto response = loginUseCase.execute(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<MetadataUserResponseDto> validateToken(Authentication authentication) {
        MetadataUserResponseDto response = validationUseCase.execute(authentication);
        return ResponseEntity.ok(response);
    }
}
