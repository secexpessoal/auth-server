package com.auth.api.controller;

import com.auth.application.usecase.VerifyAuthUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
@Tag(name = "Forward Auth", description = "Endpoints para verificação de sessão via Proxy Reverso")
public class ForwardAuthController {

    private final VerifyAuthUseCase verifyAuthUseCase;

    @GetMapping("/verify")
    @Operation(summary = "Verifica sessão para Forward Auth", description = "Lê o cookie refresh_token, valida e retorna um JWT novo no header Authorization.")
    public ResponseEntity<Void> verify(@CookieValue(value = "refresh_token", required = false) String refreshTokenCookie) {
        try {
            return Optional.ofNullable(refreshTokenCookie)
                    .filter(cookieToken -> !cookieToken.isBlank())
                    .map(verifyAuthUseCase::execute)
                    .map(jwtToken -> ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", jwtToken)).<Void>build())
                    .orElseGet(() -> {
                        log.debug("Acesso negado no Forward Auth: Cookie refresh_token ausente ou em branco.");
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                    });
        } catch (Exception exception) {
            log.warn("Falha na validação do Forward Auth. Motivo: {}", exception.getMessage(), exception);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
