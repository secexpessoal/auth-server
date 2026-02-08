/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.error;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // TODO: Adicionar a norma I18n
    UNKNOWN_ERROR(1000, "Erro desconhecido"),
    VALIDATION_FAILED(1001, "Falha na validação dos dados"),
    BUSINESS_RULE_VIOLATION(1002, "Violação da regra de negócio"),
    BAD_REQUEST(1400, "Requisição inválida"),
    UNAUTHORIZED(1401, "Não autorizado"),
    FORBIDDEN(1403, "Proibido"),
    NOT_FOUND(1404, "Recurso não encontrado"),
    INTERNAL_ERROR(1500, "Erro interno do servidor");

    private final int code;
    private final String defaultMessage;

    ErrorCode(int code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
