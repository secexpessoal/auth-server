package com.auth.application.dto;

import lombok.Builder;

/**
 * Resultado da verificação e renovação de tokens no fluxo de Forward Auth.
 */
@Builder
public record VerifyAuthResult(
        VerifyAuthStatus status,
        String accessToken,
        String refreshToken
) {
}
