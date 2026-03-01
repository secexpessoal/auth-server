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
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserAuthRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Deve registrar usuário com sucesso")
    void shouldRegisterUser() {
        RegisterRequestDto request = new RegisterRequestDto("john", "john@example.com", Role.USER);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass123")).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        UserAuth saved = userService.userRegister(request, Role.USER, "pass123");

        assertNotNull(saved);
        assertEquals("john@example.com", saved.getEmail());
        assertEquals("john@example.com", saved.getEmail());
        assertEquals("hashed", saved.getPassword());
        verify(userRepository).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção se usuário já existir")
    void shouldThrowIfUserExists() {
        RegisterRequestDto request = new RegisterRequestDto("john", "john@example.com", Role.USER);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(new UserAuth()));

        assertThrows(BadRequestException.class, () -> userService.userRegister(request, Role.USER, "pass123"));
    }

    @Test
    @DisplayName("Deve lançar NotFoundException se usuário não existir")
    void shouldThrowIfUserNotFound() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> userService.userIsPresent("ghost@example.com"));
    }
}
