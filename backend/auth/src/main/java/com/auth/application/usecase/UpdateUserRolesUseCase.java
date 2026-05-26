/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.UpdateUserRolesRequestDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.application.mapper.UserMapper;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateUserRolesUseCase {

    private final UserAuthRepository userRepository;
    private final UserMapper userMapper;

    public UserResponseDto execute(UUID userId, UpdateUserRolesRequestDto request) {
        UserAuth user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado"));

        try {
            user.updateRoles(request.roles());
            userRepository.save(user);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, exception.getMessage());
        }

        return userMapper.toResponse(user);
    }
}
