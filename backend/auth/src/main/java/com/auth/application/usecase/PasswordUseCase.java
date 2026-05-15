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
import com.auth.application.service.EmailService;
import com.auth.application.service.PasswordGeneratorService;
import com.auth.application.service.UserService;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordUseCase {

    private final UserService userService;
    private final UserAuthRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGeneratorService passwordGeneratorService;
    private final EmailService emailService;

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

    /**
     * Reset de senha solicitado pelo próprio usuário.
     * Gera uma senha temporária e envia por e-mail via Resend.
     */
    public void resetByUser(ResetPasswordRequestDto request) {
        try {
            UserAuth user = userService.userIsPresent(request.email());
            String tempPassword = passwordGeneratorService.generateTemporaryPassword();

            user.setPassword(passwordEncoder.encode(tempPassword));
            user.setPasswordResetRequired(true); // NOTE: Ativa a flag de troca obrigatória
            userRepository.save(user);

            emailService.sendResetPasswordEmail(user.getEmail(), user.getUsername(), tempPassword);
        } catch (NotFoundException notFoundException) {
            log.warn("Tentativa de reset de senha para e-mail inexistente: {}", request.email());
            // NOTE: Retornamos sucesso silencioso para evitar enumeração de e-mails
        }
    }

    private UserAuth getUserFromAuth(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof UserAuth user)) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado");
        }

        return user;
    }
}
