/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v2;

import com.auth.api.v1.dto.auth.AuthenticationRequestDto;
import com.auth.api.v1.dto.auth.UserSessionResponseDto;
import com.auth.api.v1.dto.token.RefreshTokenRequestDto;
import com.auth.api.v2.dto.auth.AuthenticationResponseDto;
import com.auth.api.v2.dto.auth.UserResponseDto;
import com.auth.api.v2.mapper.AuthMapperV2;
import com.auth.application.payload.AuthMetadata;
import com.auth.application.payload.AuthenticationResult;
import com.auth.application.service.CookieService;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.infra.util.RequestUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("authControllerV2")
@RequiredArgsConstructor
@RequestMapping(value = "/user", version = "2")
@Tag(name = "Autenticação V2", description = "Endpoints para login, renovação de token e perfil com metadados expandidos")
public class AuthController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final CookieService cookieService;
    private final AuthMapperV2 authMapperV2;

    @PostMapping("/login")
    @Operation(summary = "Realiza o login do usuário V2", description = "Retorna perfil expandido e flag profileSetupRequired.")
    public ResponseEntity<@NonNull AuthenticationResponseDto> login(
            @Valid @RequestBody AuthenticationRequestDto loginRequest,
            @RequestHeader(value = HttpHeaders.ORIGIN, required = false) String origin,
            @RequestHeader(value = HttpHeaders.REFERER, required = false) String referer,
            @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
            jakarta.servlet.http.HttpServletRequest request) {

        AuthMetadata metadata = new AuthMetadata(userAgent, RequestUtil.getClientIP(request), origin, referer);
        AuthenticationResult result = userService.login(loginRequest, metadata);

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(result.accessToken())
                .tokenVersion(result.tokenVersion())
                .passwordResetRequired(result.passwordResetRequired())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(authMapperV2.toResponse(result.user()))
                .redirectUri(result.redirectUri())
                .build();

        List<ResponseCookie> cookies = cookieService.buildAuthCookies(
            result.refreshToken(), 
            session.accessToken(), 
            result.redirectUri()
        );

        var responseBuilder = ResponseEntity.ok();
        cookies.forEach(cookie -> responseBuilder.header(HttpHeaders.SET_COOKIE, cookie.toString()));

        return responseBuilder.body(responseDto);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renova o token de acesso V2", description = "Retorna perfil expandido e novos tokens.")
    public ResponseEntity<@NonNull AuthenticationResponseDto> refresh(@CookieValue(value = "refresh_token", required = true) String refreshTokenCookie) {
        RefreshTokenRequestDto refreshRequest = new RefreshTokenRequestDto(refreshTokenCookie);
        AuthenticationResult result = refreshTokenService.refreshToken(refreshRequest);

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(result.accessToken())
                .tokenVersion(result.tokenVersion())
                .passwordResetRequired(result.passwordResetRequired())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(authMapperV2.toResponse(result.user()))
                .redirectUri(result.redirectUri())
                .build();

        List<ResponseCookie> cookies = cookieService.buildAuthCookies(
            result.refreshToken(), 
            session.accessToken()
        );

        var responseBuilder = ResponseEntity.ok();
        cookies.forEach(cookie -> responseBuilder.header(HttpHeaders.SET_COOKIE, cookie.toString()));

        return responseBuilder.body(responseDto);
    }

    @GetMapping("/profile")
    @Operation(summary = "Retorna o perfil do usuário logado V2", description = "Retorna perfil expandido e flag profileSetupRequired.")
    public ResponseEntity<@NonNull UserResponseDto> validateToken(Authentication authentication) {
        // O UserService.validateToken da V1 retorna o DTO da V1. 
        // Para a V2, buscamos a entidade do contexto e mapeamos com o mapper V2.
        if (!(authentication.getPrincipal() instanceof com.auth.domain.model.UserAuth user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authMapperV2.toResponse(user));
    }
}
