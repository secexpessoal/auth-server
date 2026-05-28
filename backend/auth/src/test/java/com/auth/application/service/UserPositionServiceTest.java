/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.domain.model.*;
import com.auth.domain.repository.PositionRepository;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.domain.repository.UserDataRepository;
import com.auth.domain.repository.UserPositionHistoryRepository;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserPositionServiceTest {

    @Mock
    private UserAuthRepository userAuthRepository;
    @Mock
    private UserDataRepository userDataRepository;
    @Mock
    private PositionRepository positionRepository;
    @Mock
    private UserPositionHistoryRepository historyRepository;

    @InjectMocks
    private UserPositionService userPositionService;

    private UserAuth testUser;
    private Position testPosition;
    private UserData testUserData;

    @BeforeEach
    void setUp() {
        testUser = new UserAuth();
        testUser.setUserId(UUID.randomUUID());
        
        testUserData = new UserData();
        testUserData.setUserId(testUser.getUserId());
        testUserData.setUser(testUser);
        testUser.setUserProfile(testUserData);

        testPosition = new Position();
        testPosition.setId(UUID.randomUUID());
        testPosition.setName("Tester");
        testPosition.setActive(true);
    }

    @Test
    @DisplayName("Deve alterar cargo com sucesso e não salvar UserAuth redundante")
    void shouldChangePositionSuccessfully() {
        UUID userId = testUser.getUserId();
        UUID positionId = testPosition.getId();

        when(userAuthRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(positionRepository.findById(positionId)).thenReturn(Optional.of(testPosition));

        userPositionService.changePosition(userId, positionId, UserPositionEventType.ASSIGNMENT, false, null, "admin", "reason");

        assertEquals(positionId, testUserData.getCurrentPosition().getPositionId());
        verify(userDataRepository).save(testUserData);
        verify(userAuthRepository, never()).save(any());
        verify(historyRepository).save(any());
    }

    @Test
    @DisplayName("Deve lançar NotFoundException se usuário não existir")
    void shouldThrowIfUserNotFound() {
        when(userAuthRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> 
            userPositionService.changePosition(UUID.randomUUID(), UUID.randomUUID(), UserPositionEventType.ASSIGNMENT, false, null, "admin", "reason")
        );
    }

    @Test
    @DisplayName("Deve lançar NotFoundException se cargo não existir")
    void shouldThrowIfPositionNotFound() {
        when(userAuthRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(positionRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> 
            userPositionService.changePosition(testUser.getUserId(), UUID.randomUUID(), UserPositionEventType.ASSIGNMENT, false, null, "admin", "reason")
        );
    }

    @Test
    @DisplayName("Deve lançar BadRequestException se cargo estiver inativo")
    void shouldThrowIfPositionInactive() {
        testPosition.setActive(false);
        when(userAuthRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(positionRepository.findById(any())).thenReturn(Optional.of(testPosition));
        
        assertThrows(BadRequestException.class, () -> 
            userPositionService.changePosition(testUser.getUserId(), testPosition.getId(), UserPositionEventType.ASSIGNMENT, false, null, "admin", "reason")
        );
    }
}
