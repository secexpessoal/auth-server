/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

import com.auth.api.v1.dto.auth.AuthenticationRequestDto;
import com.auth.application.payload.AuthMetadata;
import com.auth.application.payload.AuthenticationResult;
import com.auth.application.service.CookieService;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserService;
import com.auth.domain.model.UserAuth;
import com.auth.domain.repository.UserAuthRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AuthControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserAuthRepository userRepository;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private RefreshTokenService refreshTokenService;

    @MockitoBean
    private CookieService cookieService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("POST /v1/user/login - Deve retornar 200 e tokens")
    void shouldReturnOkOnLogin() throws Exception {
        AuthenticationRequestDto request = new AuthenticationRequestDto("admin@auth.com", "admin123", null);

        UserAuth user = new UserAuth();
        user.setEmail("admin@auth.com");

        AuthenticationResult result = AuthenticationResult.builder()
                .user(user)
                .accessToken("fake-jwt")
                .refreshToken("fake-refresh")
                .tokenVersion(1)
                .passwordResetRequired(false)
                .build();

        when(userService.login(any(), any(AuthMetadata.class))).thenReturn(result);
        when(cookieService.buildAuthCookies(anyString(), anyString(), any())).thenReturn(List.of());

        mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /v1/user/login - Deve retornar 400 se campos estiverem inválidos")
    void shouldReturnBadRequestOnInvalidLogin() throws Exception {
        AuthenticationRequestDto request = new AuthenticationRequestDto("invalid-email", "", null);

        mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
