/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.repository;

import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Deve salvar e buscar usuário por username e e-mail")
    void shouldSaveAndFindByUsernameAndEmail() {
        User user = new User();
        user.setUserName("db-user");
        user.setEmail("db@example.com");
        user.setPassword("pass");
        user.setRole(Role.USER);
        userRepository.saveAndFlush(user);

        Optional<User> foundByName = userRepository.findByUserName("db-user");
        Optional<User> foundByEmail = userRepository.findByEmail("db@example.com");

        assertTrue(foundByName.isPresent());
        assertTrue(foundByEmail.isPresent());
        assertEquals("db-user", foundByName.get().getUserName());
        assertEquals("db@example.com", foundByEmail.get().getEmail());
        assertEquals("db@example.com", foundByEmail.get().getUsername());
        assertNotNull(foundByName.get().getUserId());
    }

    @Test
    @DisplayName("Deve retornar vazio para e-mail inexistente")
    void shouldReturnEmptyForNonExistentUser() {
        Optional<User> found = userRepository.findByEmail("ghost@example.com");
        assertTrue(found.isEmpty());
    }
}
