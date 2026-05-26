/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.UserResponseDto;
import com.auth.application.mapper.UserMapper;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ValidationUseCase {

    private final UserMapper userMapper;

    public UserResponseDto execute(Authentication authentication) {
        UserAuth user = (UserAuth) Optional.ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof UserAuth)
                .orElseThrow(() -> new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado ou sessão inválida"));

        return userMapper.toResponse(user);
    }
}
