package com.auth.api.controller.v1;

import com.auth.application.dto.VerifyAuthResult;
import com.auth.application.service.RefreshTokenService;
import com.auth.infra.security.service.JwtGeneratorService;
import com.auth.infra.util.RequestUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RestController("forwardAuthControllerV1")
@RequiredArgsConstructor
@RequestMapping(value = "/auth", version = "1")
@Tag(name = "Forward Auth V1", description = "Endpoints para verificação de sessão via Proxy Reverso")
public class ForwardAuthController {

    private final RefreshTokenService refreshTokenService;
    private final JwtGeneratorService jwtService;

    @Value("${app.auth-url}")
    private String authUrl;

    @GetMapping("/verify")
    @Operation(summary = "Verifica sessão para Forward Auth", description = "Lê o cookie access_token ou header Authorization, valida e retorna 200 OK ou tenta renovação via refresh_token, ou retorna 302 Redirect.")
    public ResponseEntity<Void> verify(
            HttpServletRequest request,
            @CookieValue(value = "access_token", required = false) String accessToken,
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-Proto", required = false, defaultValue = "https") String forwardedProtocol,
            @RequestHeader(value = "X-Forwarded-Host", required = false) String forwardedHost,
            @RequestHeader(value = "X-Forwarded-Uri", required = false) String forwardedUri) {

        String tokenToValidate = accessToken;

        // 1. Tenta obter token do header Authorization se o cookie não estiver presente ou estiver vazio
        if ((tokenToValidate == null || tokenToValidate.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenToValidate = authHeader.substring(7);
            log.debug("Token obtido via header Authorization");
        }

        // 2. Valida o access_token (seja do cookie ou do header)
        if (tokenToValidate != null && !tokenToValidate.isBlank() && jwtService.isTokenValid(tokenToValidate)) {
            // PROACTIVE REFRESH: Se o token é válido mas expira em menos de 5 minutos, tentamos renovar já.
            if (jwtService.isTokenAboutToExpire(tokenToValidate, 5) && refreshToken != null && !refreshToken.isBlank()) {
                log.info("Access token próximo da expiração (janela de 5min). Iniciando Proactive Refresh.");
                try {
                    String userAgent = request.getHeader(HttpHeaders.USER_AGENT);
                    String ipAddress = RequestUtil.getClientIP(request);
                    String origin = request.getHeader(HttpHeaders.ORIGIN);
                    String referer = request.getHeader(HttpHeaders.REFERER);

                    VerifyAuthResult result = refreshTokenService.verifyAuth(refreshToken, userAgent, ipAddress, origin, referer);
                    
                    List<ResponseCookie> cookies = refreshTokenService.buildAuthCookies(result.refreshToken(), result.accessToken());

                    var responseBuilder = ResponseEntity.ok();
                    for (ResponseCookie cookie : cookies) {
                        responseBuilder.header(HttpHeaders.SET_COOKIE, cookie.toString());
                    }

                    return responseBuilder
                            .header(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", result.accessToken()))
                            .build();
                } catch (Exception exception) {
                    log.warn("Falha no Proactive Refresh, mas access_token ainda é válido. Deixando passar: {}", exception.getMessage());
                    // Se falhar o refresh proativo, deixamos passar com o token atual que ainda vale por < 5min
                }
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", tokenToValidate))
                    .build();
        }

        // 3. Se access_token for inválido/ausente, tenta renovar usando o refresh_token
        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                log.info("Access token expirado ou ausente. Tentando renovação silenciosa via refresh_token.");
                
                String userAgent = request.getHeader(HttpHeaders.USER_AGENT);
                String ipAddress = RequestUtil.getClientIP(request);
                String origin = request.getHeader(HttpHeaders.ORIGIN);
                String referer = request.getHeader(HttpHeaders.REFERER);

                VerifyAuthResult result = refreshTokenService.verifyAuth(refreshToken, userAgent, ipAddress, origin, referer);
                
                List<ResponseCookie> cookies = refreshTokenService.buildAuthCookies(result.refreshToken(), result.accessToken());

                var responseBuilder = ResponseEntity.ok();
                for (ResponseCookie cookie : cookies) {
                    responseBuilder.header(HttpHeaders.SET_COOKIE, cookie.toString());
                }

                return responseBuilder
                        .header(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", result.accessToken()))
                        .build();
            } catch (Exception exception) {
                log.warn("Falha na renovação silenciosa via Forward Auth: {}", exception.getMessage());
            }
        }

        // 4. Se tudo falhar, redireciona para o login
        log.info("Sessão inválida e renovação impossível no Forward Auth. Redirecionando para login.");
        
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
}
