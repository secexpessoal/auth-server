package com.auth.application.dto;

/**
 * Resultado da verificação e renovação de tokens no fluxo de Forward Auth.
 */
public record VerifyAuthResult(
        String accessToken,
        String refreshToken
) {
}
