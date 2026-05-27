package com.auth.application.dto;

/**
 * Metadados da requisição de autenticação para validação e auditoria.
 */
public record AuthMetadata(
        String userAgent,
        String ipAddress,
        String origin,
        String referer
) {
}
