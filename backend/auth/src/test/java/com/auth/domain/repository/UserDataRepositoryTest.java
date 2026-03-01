/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.repository;

import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.model.WorkRegime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserDataRepositoryTest {

    @Autowired
    private UserAuthRepository userRepository;

    @Autowired
    private UserDataRepository userDataRepository;

    @Test
    @DisplayName("Deve salvar e buscar dados do usuário com sucesso")
    void deveSalvarEBuscarDadosComSucesso() {
        // Arrange
        UserAuth user = new UserAuth();
        user.setEmail("profile@example.com");
        user.setPassword("password");
        user.setRoles(Set.of(Role.USER));
        userRepository.saveAndFlush(user);

        UserData data = new UserData();
        data.setUser(user);
        data.setUserName("Profile User");
        data.setRegistration("12345");
        data.setPosition("Developer");
        data.setWorkRegime(WorkRegime.HOME_WORK);
        userDataRepository.saveAndFlush(data);

        // Act
        Optional<UserData> found = userDataRepository.findById(user.getUserId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Profile User", found.get().getUserName());
        assertEquals("12345", found.get().getRegistration());
        assertEquals("Developer", found.get().getPosition());
        assertEquals(WorkRegime.HOME_WORK, found.get().getWorkRegime());
    }

    @Test
    @DisplayName("Deve atualizar dados do usuário com sucesso")
    void deveAtualizarDadosComSucesso() {
        // Arrange
        UserAuth user = new UserAuth();
        user.setEmail("update@example.com");
        user.setPassword("password");
        user.setRoles(Set.of(Role.USER));
        userRepository.saveAndFlush(user);

        UserData data = new UserData();
        data.setUser(user);
        data.setUserName("Old Name");
        userDataRepository.saveAndFlush(data);

        // Act
        data.setUserName("New Name");
        userDataRepository.saveAndFlush(data);

        // Assert
        UserData updated = userDataRepository.findById(user.getUserId()).orElseThrow();
        assertEquals("New Name", updated.getUserName());
    }
}
