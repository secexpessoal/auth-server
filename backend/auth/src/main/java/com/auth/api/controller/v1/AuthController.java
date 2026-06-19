/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller.v1;

import com.auth.api.v1.dto.auth.AuthenticationRequestDto;
import com.auth.api.v1.dto.auth.AuthenticationResponseDto;
import com.auth.api.v1.dto.auth.UserResponseDtoV1;
import com.auth.api.v1.dto.auth.UserSessionResponseDto;
import com.auth.api.v1.dto.token.RefreshTokenRequestDto;
import com.auth.api.v1.mapper.UserMapper;
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

/**
 * Controller responsável pela autenticação e gestão de sessão.
 */
@RestController("authControllerV1")
@RequiredArgsConstructor
@RequestMapping(value = "/user", version = "1")
@Tag(name = "Autenticação V1", description = "Endpoints para login, renovação de token e perfil")
public class AuthController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final CookieService cookieService;
    private final UserMapper userMapper;

    // NOTE: Rota publica
    @PostMapping("/login")
    @Operation(summary = "Realiza o login do usuário", description = "Valida as credenciais, retorna JWT no JSON e envia Refresh Token num cookie HttpOnly.")
    public ResponseEntity<@NonNull AuthenticationResponseDto> login(
            @Valid @RequestBody AuthenticationRequestDto loginRequest,
            @RequestHeader(value = HttpHeaders.ORIGIN, required = false) String origin,
            @RequestHeader(value = HttpHeaders.REFERER, required = false) String referer,
            @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
            jakarta.servlet.http.HttpServletRequest request) {

        request.setAttribute("attempted_email", loginRequest.email());
        AuthMetadata metadata = new AuthMetadata(userAgent, RequestUtil.getClientIP(request), origin, referer);
        AuthenticationResult result = userService.login(loginRequest, metadata);

        UserSessionResponseDto session = UserSessionResponseDto.builder()
                .accessToken(result.accessToken())
                .tokenVersion(result.tokenVersion())
                .passwordResetRequired(result.passwordResetRequired())
                .build();

        AuthenticationResponseDto responseDto = AuthenticationResponseDto.builder()
                .session(session)
                .user(userMapper.toResponse(result.user()))
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

    // NOTE: Rota publica
    @PostMapping("/refresh")
    @Operation(summary = "Renova o token de acesso", description = "Lê o Refresh Token do cookie HttpOnly e retorna um novo Access Token.")
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
                .user(userMapper.toResponse(result.user()))
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

    @PostMapping("/logout")
    @Operation(summary = "Logout do usuário", description = "Invalida a sessão destruindo o cookie no navegador e removendo o token do banco.")
    public ResponseEntity<Void> logout(@CookieValue(value = "refresh_token", required = false) String refreshToken) {
        refreshTokenService.logout(refreshToken);
        List<ResponseCookie> cookies = cookieService.buildLogoutCookies();

        var responseBuilder = ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "/login");
        
        cookies.forEach(cookie -> responseBuilder.header(HttpHeaders.SET_COOKIE, cookie.toString()));
        
        return responseBuilder.build();
    }

    // NOTE: Rota privada, usuário precisa mandar o token
    @GetMapping("/profile")
    @Operation(summary = "Retorna o perfil do usuário logado", description = "Extrai informações detalhadas do usuário a partir do token JWT enviado no Header.")
    public ResponseEntity<@NonNull UserResponseDtoV1> validateToken(Authentication authentication) {
        UserResponseDtoV1 response = userService.validateToken(authentication);
        return ResponseEntity.ok(response);
    }
}
