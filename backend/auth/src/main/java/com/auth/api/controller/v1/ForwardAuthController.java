package com.auth.api.controller.v1;

import com.auth.application.payload.AuthMetadata;
import com.auth.application.payload.VerifyAuthResult;
import com.auth.application.payload.VerifyAuthStatus;
import com.auth.application.service.CookieService;
import com.auth.application.service.RefreshTokenService;
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
    private final CookieService cookieService;

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

        String tokenToValidate = extractToken(accessToken, authHeader);
        AuthMetadata metadata = extractMetadata(request);

        VerifyAuthResult result = refreshTokenService.verifyAuth(tokenToValidate, refreshToken, metadata);

        if (result.status() == VerifyAuthStatus.UNAUTHORIZED) {
            return buildRedirectResponse(forwardedProtocol, forwardedHost, forwardedUri);
        }

        var responseBuilder = ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, String.format("Bearer %s", result.accessToken()));

        if (result.status() == VerifyAuthStatus.RENEWED) {
            List<ResponseCookie> cookies = cookieService.buildAuthCookies(result.refreshToken(), result.accessToken());
            cookies.forEach(cookie -> responseBuilder.header(HttpHeaders.SET_COOKIE, cookie.toString()));
        }

        return responseBuilder.build();
    }

    private String extractToken(String cookieToken, String authHeader) {
        if (cookieToken != null && !cookieToken.isBlank()) {
            return cookieToken;
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private AuthMetadata extractMetadata(HttpServletRequest request) {
        return new AuthMetadata(
                request.getHeader(HttpHeaders.USER_AGENT),
                RequestUtil.getClientIP(request),
                request.getHeader(HttpHeaders.ORIGIN),
                request.getHeader(HttpHeaders.REFERER)
        );
    }

    private ResponseEntity<Void> buildRedirectResponse(String proto, String host, String uri) {
        HttpServletRequest request = RequestUtil.getCurrentRequest().orElse(null);
        
        String clientIp = "unknown";
        String userAgent = "unknown";
        String tokenDetails = "";
        if (request != null) {
            clientIp = RequestUtil.getClientIP(request);
            userAgent = request.getHeader(HttpHeaders.USER_AGENT);
            
            String accessToken = null;
            String refreshToken = null;
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie cookie : cookies) {
                    if ("access_token".equals(cookie.getName())) accessToken = cookie.getValue();
                    if ("refresh_token".equals(cookie.getName())) refreshToken = cookie.getValue();
                }
            }
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if ((accessToken == null || accessToken.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
                accessToken = authHeader.substring(7);
            }
            
            StringBuilder reasons = new StringBuilder();
            if (accessToken == null || accessToken.isBlank()) {
                reasons.append("access_token ausente");
            } else {
                reasons.append("access_token inválido/expirado");
            }
            if (refreshToken == null || refreshToken.isBlank()) {
                reasons.append(" e refresh_token ausente");
            } else {
                reasons.append(" e refresh_token presente");
            }
            tokenDetails = " (Motivo: " + reasons.toString() + ")";
        }
        
        String targetUrl = (host != null && !host.isBlank()) ? String.format("%s://%s%s", proto, host, (uri != null ? uri : "")) : "unknown";
        log.info("Sessão inválida no Forward Auth via IP {} (UA: {}). Redirecionando para login. Destino original: {}{}", 
                clientIp, userAgent, targetUrl, tokenDetails);
        
        String loginUrl = String.format("%s/login", authUrl);
        
        if (host != null && !host.isBlank()) {
            String returnUrl = String.format("%s://%s%s", proto, host, (uri != null ? uri : ""));
            String encodedReturnUrl = URLEncoder.encode(returnUrl, StandardCharsets.UTF_8);
            loginUrl = String.format("%s?redirectUri=%s", loginUrl, encodedReturnUrl);
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(loginUrl))
                .build();
    }
}
