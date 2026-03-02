/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.domain.repository.UserDataRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Serviço de baixo nível para gestão da entidade de Usuário.
 * Lida exclusivamente com persistência, busca e manipulação de estado do modelo User.
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserAuthRepository userRepository;
    private final UserDataRepository userDataRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registra um novo usuário no banco de dados.
     * O ID (UUIDv7) é gerado automaticamente pelo Hibernate.
     *
     * @param request Dados do novo usuário
     * @param role    Cargo a ser atribuído
     * @param tempPassword Senha temporária gerada previamente
     * @return A entidade User persistida
     * @throws BadRequestException Caso o nome de usuário já exista
     */
    public UserAuth userRegister(RegisterRequestDto request, Role role, String tempPassword) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, "Este e-mail já está em uso!");
        }

        UserAuth user = new UserAuth();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.getRoles().add(role);
        user.setPasswordResetRequired(true);
        
        // Save user first to generate its ID and make it available for UserData
        user = userRepository.save(user);

        UserData userData = new UserData();
        userData.setUserName(request.userName());
        userData.setUser(user);
        
        userData = userDataRepository.save(userData);
        
        user.setUserData(userData);

        return userRepository.save(user);
    }

    /**
     * Incrementa a versão do token para invalidar Access Tokens (JWT) antigos.
     *
     * @param user Usuário que terá a sessão rotacionada
     */
    public void incrementTokenVersion(UserAuth user) {
        Integer currentVersion = user.getTokenVersion();
        user.setTokenVersion(currentVersion + 1);
        userRepository.save(user);
    }

    /**
     * Busca um usuário pelo e-mail no repositório.
     *
     * @param email E-mail alvo
     * @return Entidade User encontrada
     * @throws NotFoundException Caso o usuário não exista
     */
    public UserAuth userIsPresent(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado!"));
    }
}
