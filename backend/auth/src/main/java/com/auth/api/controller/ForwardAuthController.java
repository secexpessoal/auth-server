package com.auth.api.controller;

import com.auth.application.usecase.VerifyAuthUseCase;
import com.auth.infra.security.service.JwtGeneratorService;
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

import java.net.URI;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
@Tag(name = "Forward Auth", description = "Endpoints para verificação de sessão via Proxy Reverso")
public class ForwardAuthController {

    private final VerifyAuthUseCase verifyAuthUseCase;
    private final JwtGeneratorService jwtService;

    @GetMapping("/verify")
    @Operation(summary = "Verifica sessão para Forward Auth", description = "Lê o cookie access_token, valida e retorna 200 OK ou 302 Redirect.")
    public ResponseEntity<Void> verify(@CookieValue(value = "access_token", required = false) String accessToken) {
        if (accessToken == null || accessToken.isBlank() || !jwtService.isTokenValid(accessToken)) {
            log.info("Sessão inválida ou ausente no Forward Auth. Redirecionando para login.");
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/login"))
                    .build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", accessToken))
                .build();
    }
}
