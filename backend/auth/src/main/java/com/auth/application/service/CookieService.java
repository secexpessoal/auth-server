package com.auth.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CookieService {

    @Value("${security.jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${security.jwt.refresh-expiration-time:604800000}")
    private long refreshTokenExpiration;

    @Value("${app.base-domain:}")
    private String baseDomain;

    public ResponseCookie buildRefreshTokenCookie(String refreshToken) {
        long maxAgeSeconds = refreshTokenExpiration / 1000;

        var builder = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Strict");

        Optional.ofNullable(baseDomain)
                .filter(domain -> !domain.isBlank())
                .ifPresent(builder::domain);

        return builder.build();
    }

    public ResponseCookie buildLogoutCookie() {
        var builder = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0) // Remove o cookie
                .sameSite("Strict");

        Optional.ofNullable(baseDomain)
                .filter(domain -> !domain.isBlank())
                .ifPresent(builder::domain);

        return builder.build();
    }
}
