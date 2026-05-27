package com.auth.application.dto;

/**
 * Status do resultado da verificação de Forward Auth.
 */
public enum VerifyAuthStatus {
    /**
     * Sessão válida e ativa.
     */
    AUTHORIZED,

    /**
     * Sessão renovada silenciosamente (novos tokens gerados).
     */
    RENEWED,

    /**
     * Sessão inválida ou expirada, requer redirecionamento para login.
     */
    UNAUTHORIZED
}
