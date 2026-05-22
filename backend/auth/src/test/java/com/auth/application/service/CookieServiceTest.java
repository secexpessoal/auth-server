/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class CookieServiceTest {

    private CookieService cookieService;

    @BeforeEach
    void setUp() {
        cookieService = new CookieService();
        ReflectionTestUtils.setField(cookieService, "cookieSecure", true);
        ReflectionTestUtils.setField(cookieService, "refreshTokenExpiration", 604800000L);
    }

    @Test
    @DisplayName("Deve construir cookie de refresh token corretamente")
    void deveConstruirCookieRefreshToken() {
        String token = "test-refresh-token";
        ResponseCookie cookie = cookieService.buildRefreshTokenCookie(token);

        assertNotNull(cookie);
        assertEquals("refresh_token", cookie.getName());
        assertEquals(token, cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
        assertEquals("/", cookie.getPath());
        assertEquals("Lax", cookie.getSameSite());
        assertEquals(604800L, cookie.getMaxAge().getSeconds());
    }

    @Test
    @DisplayName("Deve construir cookie de access token corretamente")
    void deveConstruirCookieAccessToken() {
        String token = "test-access-token";
        ReflectionTestUtils.setField(cookieService, "accessTokenExpiration", 900000L);
        ResponseCookie cookie = cookieService.buildAccessTokenCookie(token);

        assertNotNull(cookie);
        assertEquals("access_token", cookie.getName());
        assertEquals(token, cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
        assertEquals("/", cookie.getPath());
        assertEquals("Lax", cookie.getSameSite());
        assertEquals(900L, cookie.getMaxAge().getSeconds());
    }

    @Test
    @DisplayName("Deve construir cookie de logout de refresh token corretamente")
    void deveConstruirCookieLogout() {
        ResponseCookie cookie = cookieService.buildRefreshTokenLogoutCookie();

        assertNotNull(cookie);
        assertEquals("refresh_token", cookie.getName());
        assertEquals("", cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(0L, cookie.getMaxAge().getSeconds());
        assertEquals("Lax", cookie.getSameSite());
    }

    @Test
    @DisplayName("Deve construir cookie de logout de access token corretamente")
    void deveConstruirCookieAccessTokenLogout() {
        ResponseCookie cookie = cookieService.buildAccessTokenLogoutCookie();

        assertNotNull(cookie);
        assertEquals("access_token", cookie.getName());
        assertEquals("", cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(0L, cookie.getMaxAge().getSeconds());
        assertEquals("Lax", cookie.getSameSite());
    }
}
