/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.config;

import com.auth.domain.model.UserData;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@Profile("!test")
@RequiredArgsConstructor
public class DatabaseMigrationService {

    private final MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void runMigrations() {
        log.info("Iniciando migrações de banco de dados...");
        try {
            cleanupDuplicateProfiles();
            ensureUniqueIndexes();
            log.info("Migrações concluídas com sucesso.");
        } catch (Exception e) {
            log.error("Erro crítico durante as migrações de banco de dados: {}", e.getMessage(), e);
        }
    }

    private void cleanupDuplicateProfiles() {
        log.info("Verificando perfis duplicados na coleção 'user_profiles'...");
        
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.group("user").count().as("count").push("$$ROOT").as("docs"),
                Aggregation.match(Criteria.where("count").gt(1))
        );

        AggregationResults<DuplicateGroup> results = mongoTemplate.aggregate(aggregation, "user_profiles", DuplicateGroup.class);
        
        int deletedCount = 0;
        for (DuplicateGroup group : results.getMappedResults()) {
            List<UserData> docs = group.getDocs();
            
            // Ordenar por updatedAt desc (mais recente primeiro)
            docs.sort((a, b) -> {
                Instant t1 = a.getUpdatedAt() != null ? a.getUpdatedAt() : Instant.MIN;
                Instant t2 = b.getUpdatedAt() != null ? b.getUpdatedAt() : Instant.MIN;
                return t2.compareTo(t1);
            });

            // Manter o primeiro (mais recente), deletar os outros
            for (int i = 1; i < docs.size(); i++) {
                mongoTemplate.remove(docs.get(i));
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            log.warn("Limpeza concluída: {} perfis duplicados removidos.", deletedCount);
        } else {
            log.info("Nenhum perfil duplicado encontrado.");
        }
    }

    private void ensureUniqueIndexes() {
        log.info("Garantindo índices únicos...");
        try {
            mongoTemplate.indexOps("user_profiles").ensureIndex(
                    new Index().on("user", Sort.Direction.ASC).unique()
            );
            log.info("Índice único em 'user_profiles.user' garantido.");
        } catch (Exception e) {
            log.error("Erro ao criar índice único em 'user_profiles.user': {}", e.getMessage());
        }
    }

    @Data
    public static class DuplicateGroup {
        private String id; // O campo de agrupamento ("user")
        private long count;
        private List<UserData> docs;
    }
}
