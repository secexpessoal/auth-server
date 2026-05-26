/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.domain.model.Position;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.model.UserData.UserPositionAssignment;
import com.auth.domain.model.UserPositionHistory;
import com.auth.domain.repository.PositionRepository;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.domain.repository.UserDataRepository;
import com.auth.domain.repository.UserPositionHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPositionService {

    private final UserAuthRepository userAuthRepository;
    private final UserDataRepository userDataRepository;
    private final PositionRepository positionRepository;
    private final UserPositionHistoryRepository historyRepository;

    /**
     * Altera o cargo de um usuário.
     */
    public void changePosition(UUID userId, UUID newPositionId, boolean temporary, Instant endDate, String changedBy, String reason) {
        UserAuth user = userAuthRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Position newPosition = positionRepository.findById(newPositionId)
                .orElseThrow(() -> new RuntimeException("Cargo não encontrado ou inativo"));
        
        if (!newPosition.isActive()) {
            throw new RuntimeException("O cargo selecionado não está ativo");
        }

        UserData userData = user.getUserProfile();
        if (userData == null) {
            throw new RuntimeException("Perfil do usuário não encontrado. Não é possível atribuir cargo.");
        }

        UserPositionAssignment current = userData.getCurrentPosition();
        
        if (current != null) {
            // Registra o fim do cargo atual no histórico
            recordHistory(userId, current.getPositionId(), null, current.getStartDate(), Instant.now(), changedBy, "POSITION_CHANGED");
        }

        user.assignPosition(newPosition.getId(), temporary, endDate);
        
        userDataRepository.save(userData);
        userAuthRepository.save(user);

        recordHistory(userId, newPosition.getId(), newPosition.getName(), Instant.now(), null, changedBy, reason);
    }

    /**
     * Task agendada para reverter cargos temporários expirados.
     * Executa todo dia à meia-noite.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void revertExpiredPositions() {
        log.info("Iniciando verificação de cargos temporários expirados...");
        List<UserData> expiredUsers = userDataRepository.findAll().stream()
                .filter(user -> user.getCurrentPosition() != null 
                        && user.getCurrentPosition().isTemporary() 
                        && user.getCurrentPosition().getEndDate() != null 
                        && user.getCurrentPosition().getEndDate().isBefore(Instant.now()))
                .toList();

        for (UserData user : expiredUsers) {
            try {
                revertPosition(user);
            } catch (Exception exception) {
                log.error("Erro ao reverter cargo do usuário {}: {}", user.getUserId(), exception.getMessage());
            }
        }
        log.info("Verificação de cargos expirados concluída. {} usuários revertidos.", expiredUsers.size());
    }

    private void revertPosition(UserData userData) {
        UserPositionAssignment current = userData.getCurrentPosition();
        if (current == null || current.getPreviousPositionId() == null) return;

        Position previousPosition = positionRepository.findById(current.getPreviousPositionId())
                .orElseThrow(() -> new RuntimeException("Cargo anterior não encontrado"));

        // Registra o fim do cargo temporário no histórico
        recordHistory(userData.getUserId(), current.getPositionId(), null, current.getStartDate(), Instant.now(), "SYSTEM", "TEMPORARY_EXPIRED");

        userData.assignPosition(previousPosition.getId(), false, null);
        userDataRepository.save(userData);

        recordHistory(userData.getUserId(), previousPosition.getId(), previousPosition.getName(), Instant.now(), null, "SYSTEM", "AUTOMATIC_REVERSION");
    }

    private void recordHistory(UUID userId, UUID posId, String posName, Instant start, Instant end, String by, String reason) {
        UserPositionHistory history = UserPositionHistory.builder()
                .userId(userId)
                .positionId(posId)
                .positionName(posName)
                .startDate(start)
                .endDate(end)
                .changedBy(by)
                .reason(reason)
                .build();
        historyRepository.save(history);
    }
}
