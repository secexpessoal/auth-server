package com.auth.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    @Value("${security.jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${security.jwt.refresh-expiration-time:604800000}")
    private long refreshTokenExpiration;

    public ResponseCookie buildRefreshTokenCookie(String refreshToken) {
        long maxAgeSeconds = refreshTokenExpiration / 1000;

        return ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/v1/user")
                .maxAge(maxAgeSeconds)
                .sameSite("Strict")
                .build();
    }

    public ResponseCookie buildLogoutCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/v1/user")
                .maxAge(0) // Remove o cookie
                .sameSite("Strict")
                .build();
    }
}
