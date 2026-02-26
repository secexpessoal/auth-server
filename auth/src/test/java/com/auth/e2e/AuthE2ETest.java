/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.e2e;

import com.auth.api.dto.auth.AuthenticationRequestDto;
import com.auth.api.dto.auth.AuthenticationResponseDto;
import com.auth.api.dto.auth.RegisterRequestDto;
import com.auth.api.dto.password.FirstChangePasswordRequestDto;
import com.auth.api.dto.password.ResetPasswordRequestDto;
import com.auth.api.dto.token.RefreshTokenRequestDto;
import com.auth.domain.model.Role;
import com.auth.domain.model.User;
import com.auth.domain.repository.RefreshTokenRepository;
import com.auth.domain.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AuthE2ETest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll(); 
    }

    @Test
    @DisplayName("Fluxo Completo: Registro -> Login -> Profile -> Refresh -> Profile")
    void fullAuthFlow() throws Exception {
        // 1. Registro
        RegisterRequestDto regRequest = new RegisterRequestDto("e2euser", "e2e@example.com", "password123");
        mockMvc.perform(post("/v1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        // 2. Login
        AuthenticationRequestDto loginRequest = new AuthenticationRequestDto("e2e@example.com", "password123");
        MvcResult loginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        AuthenticationResponseDto authResponse = objectMapper.readValue(responseBody, AuthenticationResponseDto.class);
        String accessToken = authResponse.token();
        String refreshToken = authResponse.refreshToken();

        // 3. Acessar Profile
        mockMvc.perform(get("/v1/user/profile")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("e2euser"))
                .andExpect(jsonPath("$.email").value("e2e@example.com"));

        // 4. Refresh Token
        RefreshTokenRequestDto refreshRequest = new RefreshTokenRequestDto(refreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/v1/user/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String newResponseBody = refreshResult.getResponse().getContentAsString();
        AuthenticationResponseDto newAuthResponse = objectMapper.readValue(newResponseBody, AuthenticationResponseDto.class);
        String newAccessToken = newAuthResponse.token();

        // 5. Acessar Profile com novo token
        mockMvc.perform(get("/v1/user/profile")
                .header("Authorization", "Bearer " + newAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("e2euser"))
                .andExpect(jsonPath("$.email").value("e2e@example.com"));
        
        // 6. Tentar usar o token antigo (Deve falhar devido ao Versioning)
        mockMvc.perform(get("/v1/user/profile")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Fluxo de Segurança: Admin Reset -> Login -> First Change")
    void adminResetFlow() throws Exception {
        // 1. Criar admin diretamente no banco para bootstrap
        User admin = new User();
        admin.setUserName("admin-e2e");
        admin.setEmail("admin-e2e@auth.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.saveAndFlush(admin);

        // Login do admin para pegar token
        AuthenticationRequestDto adminLogin = new AuthenticationRequestDto("admin-e2e@auth.com", "admin123");
        MvcResult adminLoginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminLoginResult.getResponse().getContentAsString(), AuthenticationResponseDto.class).token();

        // 2. Criar usuário normal
        RegisterRequestDto regRequest = new RegisterRequestDto("user-to-reset", "to-reset@example.com", "original-pass");
        mockMvc.perform(post("/v1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        // 3. Admin reseta a senha do usuário
        ResetPasswordRequestDto resetRequest = new ResetPasswordRequestDto("to-reset@example.com");
        MvcResult resetResult = mockMvc.perform(post("/v1/password/admin-reset")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, String> resetResponse = objectMapper.readValue(resetResult.getResponse().getContentAsString(), Map.class);
        String tempPassword = resetResponse.get("temp_password");

        // 4. Usuário tenta logar com a senha temporária
        AuthenticationRequestDto loginRequest = new AuthenticationRequestDto("to-reset@example.com", tempPassword);
        MvcResult loginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password_reset_required").value(true))
                .andReturn();

        String userToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthenticationResponseDto.class).token();

        // 5. Usuário troca a senha definitivamente
        FirstChangePasswordRequestDto changeRequest = new FirstChangePasswordRequestDto("new-definitive-password");
        mockMvc.perform(post("/v1/password/first-change")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(changeRequest)))
                .andExpect(status().isOk());

        // 6. Login final com nova senha
        AuthenticationRequestDto finalLogin = new AuthenticationRequestDto("to-reset@example.com", "new-definitive-password");
        mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(finalLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password_reset_required").value(false));
    }
}
