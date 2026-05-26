/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.application.mapper.UserMapper;
import com.auth.application.service.PasswordGeneratorService;
import com.auth.application.service.UserService;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserService userService;
    private final PasswordGeneratorService passwordGeneratorService;
    private final UserMapper userMapper;

    public UserResponseDto execute(RegisterRequestDto request, Role role) {
        String tempPassword = passwordGeneratorService.generateTemporaryPassword();

        UserAuth user = Optional.ofNullable(userService.userRegister(request, role, tempPassword))
                .orElseThrow(() -> new BadRequestException(ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao registrar usuário"));

        return userMapper.toResponse(user, tempPassword);
    }
}
