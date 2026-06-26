/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.config;

import com.auth.application.service.CookieService;
import com.auth.application.service.CustomUserDetailsService;
import com.auth.application.service.PositionService;
import com.auth.application.service.RefreshTokenService;
import com.auth.application.service.UserPositionService;
import com.auth.application.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class SwaggerSecurityTest {

    private static final List<String> SWAGGER_PATHS = List.of(
            "/swagger-ui.html",
            "/swagger-ui/index.html",
            "/v3/api-docs",
            "/v3/api-docs/v1",
            "/v3/api-docs.yaml"
    );

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private RefreshTokenService refreshTokenService;

    @MockitoBean
    private CookieService cookieService;

    @MockitoBean
    private PositionService positionService;

    @MockitoBean
    private UserPositionService userPositionService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Swagger deve retornar 401 para usuário não autenticado")
    void swaggerDeveRetornar401ParaUsuarioNaoAutenticado() throws Exception {
        mockMvc.perform(get("/v3/api-docs").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Swagger deve retornar 403 para usuário sem cargo ADMIN")
    @WithMockUser(roles = "USER")
    void swaggerDeveRetornar403ParaUsuarioSemCargoAdmin() throws Exception {
        for (String path : SWAGGER_PATHS) {
            mockMvc.perform(get(path).accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Swagger deve permitir acesso para ADMIN")
    @WithMockUser(roles = "ADMIN")
    void swaggerDevePermitirAcessoParaAdmin() throws Exception {
        mockMvc.perform(get("/v3/api-docs").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
