/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.password.ChangePasswordRequestDto;
import com.auth.api.dto.password.FirstChangePasswordRequestDto;
import com.auth.api.dto.password.ResetPasswordRequestDto;
import com.auth.application.service.PasswordGeneratorService;
import com.auth.application.service.UserService;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordUseCase {

    private final UserService userService;
    private final UserAuthRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGeneratorService passwordGeneratorService;

    /**
     * Troca a senha do usuário logado (Fluxo Normal).
     */
    public void changePassword(Authentication authentication, ChangePasswordRequestDto request) {
        UserAuth user = getUserFromAuth(authentication);
        user = userService.userIsPresent(user.getEmail());

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, "A senha atual informada está incorreta.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetRequired(false);
        userRepository.save(user);
    }

    /**
     * Troca a senha de primeiro acesso / reset obrigatório.
     */
    public void changeFirstPassword(Authentication authentication, FirstChangePasswordRequestDto request) {
        UserAuth user = getUserFromAuth(authentication);
        user = userService.userIsPresent(user.getEmail());

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetRequired(false); // Limpa a flag
        userRepository.save(user);
    }

    /**
     * Reset de senha efetuado por ADMIN.
     */
    public String resetByAdmin(ResetPasswordRequestDto request) {
        UserAuth user = userService.userIsPresent(request.email());

        String tempPassword = passwordGeneratorService.generateTemporaryPassword();

        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setPasswordResetRequired(true); // NOTE: Ativa a flag de troca obrigatória
        userRepository.save(user);

        return tempPassword;
    }

    private UserAuth getUserFromAuth(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof UserAuth user)) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado");
        }

        return user;
    }
}
