package com.auth.api.controller;

import com.auth.application.usecase.VerifyAuthUseCase;
import com.auth.infra.security.service.JwtGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
@Tag(name = "Forward Auth", description = "Endpoints para verificação de sessão via Proxy Reverso")
public class ForwardAuthController {

    private final VerifyAuthUseCase verifyAuthUseCase;
    private final JwtGeneratorService jwtService;

    @Value("${app.auth-url}")
    private String authUrl;

    @GetMapping("/verify")
    @Operation(summary = "Verifica sessão para Forward Auth", description = "Lê o cookie access_token, valida e retorna 200 OK ou 302 Redirect.")
    public ResponseEntity<Void> verify(
            @CookieValue(value = "access_token", required = false) String accessToken,
            @RequestHeader(value = "X-Forwarded-Proto", required = false, defaultValue = "https") String forwardedProtocol,
            @RequestHeader(value = "X-Forwarded-Host", required = false) String forwardedHost,
            @RequestHeader(value = "X-Forwarded-Uri", required = false) String forwardedUri) {

        if (accessToken == null || accessToken.isBlank() || !jwtService.isTokenValid(accessToken)) {
            log.info("Sessão inválida ou ausente no Forward Auth. Preparando redirecionamento.");
            
            String loginUrl = authUrl + "/login";
            
            if (forwardedHost != null && !forwardedHost.isBlank()) {
                String returnUrl = forwardedProtocol + "://" + forwardedHost + (forwardedUri != null ? forwardedUri : "");
                String encodedReturnUrl = URLEncoder.encode(returnUrl, StandardCharsets.UTF_8);
                loginUrl += "?redirectUri=" + encodedReturnUrl;
                log.debug("Redirecionando para login com retorno para: {}", returnUrl);
            }

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(loginUrl))
                    .build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", accessToken))
                .build();
    }
}
