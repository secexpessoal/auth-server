package com.auth.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CookieService {

    @Value("${security.jwt.cookie.secure}")
    private boolean cookieSecure;

    @Value("${security.jwt.expiration-time}")
    private long accessTokenExpiration;

    @Value("${security.jwt.refresh-expiration-time}")
    private long refreshTokenExpiration;

    @Value("${app.base-domain}")
    private String baseDomain;

    public ResponseCookie buildAccessTokenCookie(String accessToken) {
        long maxAgeSeconds = accessTokenExpiration / 1000;

        var builder = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax");

        applyDomain(builder);

        return builder.build();
    }

    public ResponseCookie buildRefreshTokenCookie(String refreshToken) {
        long maxAgeSeconds = refreshTokenExpiration / 1000;

        var builder = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax");

        applyDomain(builder);

        return builder.build();
    }

    public ResponseCookie buildRefreshTokenLogoutCookie() {
        var builder = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax");

        applyDomain(builder);
        return builder.build();
    }

    /**
     * Adiciona o cookie de limpeza para o access_token no logout.
     */
    public ResponseCookie buildAccessTokenLogoutCookie() {
        var builder = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax");

        applyDomain(builder);
        return builder.build();
    }

    /**
     * Cria um cookie temporário para gerenciar o redirecionamento SSO no servidor.
     */
    public ResponseCookie buildSsoRedirectCookie(String redirectUri) {
        return ResponseCookie.from("sso_redirect", redirectUri)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(120) // 2 minutos
                .sameSite("Lax")
                .build();
    }

    /**
     * Invalida o cookie de redirecionamento SSO.
     */
    public ResponseCookie buildSsoRedirectLogoutCookie() {
        return ResponseCookie.from("sso_redirect", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    public java.util.List<ResponseCookie> buildAuthCookies(String refreshToken, String accessToken, String redirectUri) {
        java.util.List<ResponseCookie> cookies = new java.util.ArrayList<>();
        
        cookies.add(buildRefreshTokenCookie(refreshToken));
        cookies.add(buildAccessTokenCookie(accessToken));

        if (redirectUri != null && !redirectUri.isBlank()) {
            cookies.add(buildSsoRedirectCookie(redirectUri));
        }

        return cookies;
    }

    public java.util.List<ResponseCookie> buildAuthCookies(String refreshToken, String accessToken) {
        return buildAuthCookies(refreshToken, accessToken, null);
    }

    public java.util.List<ResponseCookie> buildLogoutCookies() {
        return java.util.List.of(
                buildRefreshTokenLogoutCookie(),
                buildAccessTokenLogoutCookie()
        );
    }

    private void applyDomain(ResponseCookie.ResponseCookieBuilder builder) {
        Optional.ofNullable(baseDomain)
                .filter(domain -> !domain.isBlank())
                .ifPresent(domain -> {
                    String domainWithDot = domain.startsWith(".") ? domain : "." + domain;
                    builder.domain(domainWithDot);
                });
    }
}
