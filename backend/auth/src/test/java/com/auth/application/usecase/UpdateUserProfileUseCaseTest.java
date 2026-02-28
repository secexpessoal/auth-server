/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.auth.InPersonWorkPeriodDto;
import com.auth.api.dto.auth.UpdateUserProfileRequestDto;
import com.auth.api.dto.auth.UserResponseDto;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.model.WorkRegime;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UpdateUserProfileUseCaseTest {

    @Mock
    private UserAuthRepository userRepository;

    @InjectMocks
    private UpdateUserProfileUseCase updateUserProfileUseCase;

    private UserAuth testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new UserAuth();
        testUser.setUserId(userId);
        testUser.setEmail("test@example.com");
        testUser.setActive(true);
        testUser.setRoles(Set.of(Role.USER));

        UserData userData = new UserData();
        userData.setUserName("olduser");
        userData.setRegistration("11111");
        userData.setUser(testUser);
        testUser.setUserData(userData);
    }

    @Test
    @DisplayName("Deve atualizar os campos do perfil com sucesso")
    void deveAtualizarPerfilComSucesso() {
        // Arrange
        UpdateUserProfileRequestDto request = UpdateUserProfileRequestDto.builder()
                .username("newuser")
                .position("Developer")
                .workRegime(WorkRegime.HYBRID)
                .build();
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act
        UserResponseDto response = updateUserProfileUseCase.execute(userId, request);

        // Assert
        assertEquals("newuser", response.profile().username());
        assertEquals("Developer", response.profile().position());
        assertEquals(WorkRegime.HYBRID, response.profile().workRegime());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Deve aplicar a lógica de prioridade entre máscara semanal e duração consecutiva")
    void deveAplicarPrioridadeDeMascara() {
        // Arrange
        InPersonWorkPeriodDto workPeriod = InPersonWorkPeriodDto.builder()
                .frequencyCycleWeeks(1)
                .frequencyWeekMask(31) // Seg-Sex
                .frequencyDurationDays(10) // Consecutivo (deve ser ignorado se mask > 0)
                .build();
        
        UpdateUserProfileRequestDto request = UpdateUserProfileRequestDto.builder()
                .inPersonWorkPeriod(workPeriod)
                .build();
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act
        UserResponseDto response = updateUserProfileUseCase.execute(userId, request);

        // Assert
        assertNull(response.profile().inPersonWorkPeriod().frequencyDurationDays());
        assertEquals(31, response.profile().inPersonWorkPeriod().frequencyWeekMask());
    }

    @Test
    @DisplayName("Deve lançar BadRequestException se a duração ultrapassar 365 dias")
    void deveLancarExceptionDuraçaoInvalida() {
        // Arrange
        InPersonWorkPeriodDto workPeriod = InPersonWorkPeriodDto.builder()
                .frequencyDurationDays(400)
                .build();
        
        UpdateUserProfileRequestDto request = UpdateUserProfileRequestDto.builder()
                .inPersonWorkPeriod(workPeriod)
                .build();
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> updateUserProfileUseCase.execute(userId, request));
    }
}
