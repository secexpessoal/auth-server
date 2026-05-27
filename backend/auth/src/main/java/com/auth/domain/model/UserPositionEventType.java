/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import lombok.Getter;

/**
 * Define os tipos de eventos de transição de cargos no sistema.
 */
@Getter
public enum UserPositionEventType {
    ASSIGNMENT("Atribuição Inicial", "Primeira atribuição de cargo ao usuário."),
    PROMOTION("Promoção", "Mudança para um cargo de nível superior."),
    TRANSFER("Transferência", "Mudança horizontal entre cargos do mesmo nível."),
    TEMPORARY_START("Início Temporário", "Início de um cargo exercido por tempo determinado."),
    TEMPORARY_END("Fim Temporário", "Término do período temporário e retorno ao cargo anterior."),
    DEMOTION("Rebaixamento", "Mudança para um cargo de nível inferior."),
    CORRECTION("Correção de Dados", "Ajuste manual de cargo devido a erro de cadastro.");

    private final String label;
    private final String description;

    UserPositionEventType(String label, String description) {
        this.label = label;
        this.description = description;
    }
}
