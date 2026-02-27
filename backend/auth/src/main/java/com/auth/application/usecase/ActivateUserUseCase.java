/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.domain.model.User;
import com.auth.domain.repository.UserRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Caso de Uso responsável por ativar um usuário.
 */
@Service
@RequiredArgsConstructor
public class ActivateUserUseCase {

    private final UserRepository userRepository;

    @Transactional
    public void execute(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado com o ID: " + userId));

        user.setActive(true);
        userRepository.save(user);
    }
}
