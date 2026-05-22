package com.auth.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CookieService {

    @Value("${security.jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${security.jwt.expiration-time:900000}")
    private long accessTokenExpiration;

    @Value("${security.jwt.refresh-expiration-time:604800000}")
    private long refreshTokenExpiration;

    @Value("${app.base-domain:}")
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

    private void applyDomain(ResponseCookie.ResponseCookieBuilder builder) {
        Optional.ofNullable(baseDomain)
                .filter(domain -> !domain.isBlank())
                .ifPresent(domain -> {
                    String domainWithDot = domain.startsWith(".") ? domain : "." + domain;
                    builder.domain(domainWithDot);
                });
    }
}
