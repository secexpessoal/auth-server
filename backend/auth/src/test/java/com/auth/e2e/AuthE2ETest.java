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
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.RefreshTokenRepository;
import com.auth.domain.repository.UserAuthRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertNotNull;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
    private UserAuthRepository userRepository;

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
    @DisplayName("Fluxo Completo: Registro -> Login com Senha Temporária -> Troca Senha -> Login Final -> Profile -> Refresh -> Profile")
    void fullAuthFlow() throws Exception {
        // 0. Bootstrap Admin para poder registrar usuários (regra nova: register é ADMIN only)
        UserAuth admin = new UserAuth();
        admin.setEmail("admin-boot@auth.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRoles(java.util.Set.of(Role.ADMIN));
        admin.setActive(true);
        
        UserData adminData = new UserData();
        adminData.setUserName("admin-boot");
        adminData.setUser(admin);
        admin.setUserData(adminData);
        
        userRepository.saveAndFlush(admin);

        AuthenticationRequestDto adminLogin = new AuthenticationRequestDto("admin-boot@auth.com", "admin123");
        MvcResult adminLoginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminLoginResult.getResponse().getContentAsString(), AuthenticationResponseDto.class).session().accessToken();

        // 1. Registro (usando token do admin)
        RegisterRequestDto regRequest = new RegisterRequestDto("e2euser", "e2e@example.com", Role.USER);
        MvcResult regResult = mockMvc.perform(post("/v1/user/register")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        // Captura senha temporária
        Map<String, Object> regResponse = objectMapper.readValue(regResult.getResponse().getContentAsString(), Map.class);
        String tempPassword = (String) regResponse.get("tempPassword");
        assertNotNull(tempPassword);

        // 2. Login com senha temporária
        AuthenticationRequestDto loginRequest = new AuthenticationRequestDto("e2e@example.com", tempPassword);
        MvcResult loginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.passwordResetRequired").value(true))
                .andReturn();

        String intermediateToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthenticationResponseDto.class).session().accessToken();

        // 3. Troca de senha obrigatória
        FirstChangePasswordRequestDto changeRequest = new FirstChangePasswordRequestDto("new-secure-password");
        mockMvc.perform(post("/v1/password/first-change")
                .header("Authorization", "Bearer " + intermediateToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(changeRequest)))
                .andExpect(status().isOk());

        // 4. Login Final com nova senha
        AuthenticationRequestDto finalLoginRequest = new AuthenticationRequestDto("e2e@example.com", "new-secure-password");
        MvcResult finalLoginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(finalLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.passwordResetRequired").value(false))
                .andReturn();

        String responseBody = finalLoginResult.getResponse().getContentAsString();
        AuthenticationResponseDto authResponse = objectMapper.readValue(responseBody, AuthenticationResponseDto.class);
        String accessToken = authResponse.session().accessToken();
        
        Cookie cookie = finalLoginResult.getResponse().getCookie("refresh_token");
        assertNotNull(cookie);
        String refreshToken = cookie.getValue();

        // 5. Acessar Profile
        mockMvc.perform(get("/v1/user/profile")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.username").value("e2euser"))
                .andExpect(jsonPath("$.email").value("e2e@example.com"));

        // 6. Refresh Token
        RefreshTokenRequestDto refreshRequest = new RefreshTokenRequestDto(refreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/v1/user/refresh")
                .cookie(cookie)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        String newResponseBody = refreshResult.getResponse().getContentAsString();
        AuthenticationResponseDto newAuthResponse = objectMapper.readValue(newResponseBody, AuthenticationResponseDto.class);
        String newAccessToken = newAuthResponse.session().accessToken();

        // 7. Acessar Profile com novo token
        mockMvc.perform(get("/v1/user/profile")
                .header("Authorization", "Bearer " + newAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.username").value("e2euser"))
                .andExpect(jsonPath("$.email").value("e2e@example.com"));
    }

    @Test
    @DisplayName("Fluxo de Segurança: Admin Reset -> Login -> First Change")
    void adminResetFlow() throws Exception {
        // 1. Criar admin diretamente no banco para bootstrap
        UserAuth admin = new UserAuth();
        admin.setEmail("admin-e2e@auth.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRoles(java.util.Set.of(Role.ADMIN));
        admin.setActive(true);
        
        UserData adminData = new UserData();
        adminData.setUserName("admin-e2e");
        adminData.setUser(admin);
        admin.setUserData(adminData);
        
        userRepository.saveAndFlush(admin);

        // Login do admin para pegar token
        AuthenticationRequestDto adminLogin = new AuthenticationRequestDto("admin-e2e@auth.com", "admin123");
        MvcResult adminLoginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminLoginResult.getResponse().getContentAsString(), AuthenticationResponseDto.class).session().accessToken();

        // 2. Criar usuário normal
        RegisterRequestDto regRequest = new RegisterRequestDto("to-reset", "to-reset@example.com", Role.USER);
        mockMvc.perform(post("/v1/user/register")
                .header("Authorization", "Bearer " + adminToken)
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
        String tempPassword = resetResponse.get("tempPassword");

        // 4. Usuário tenta logar com a senha temporária
        AuthenticationRequestDto loginRequest = new AuthenticationRequestDto("to-reset@example.com", tempPassword);
        MvcResult loginResult = mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.passwordResetRequired").value(true))
                .andReturn();

        String userToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthenticationResponseDto.class).session().accessToken();

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
                .andExpect(jsonPath("$.session.passwordResetRequired").value(false));
    }

    @Test
    @DisplayName("Fluxo de Administração: Listagem -> Desativação -> Tentativa de Login -> Ativação -> Atualização de Perfil")
    void adminUserManagementFlow() throws Exception {
        // 1. Bootstrap Admin
        UserAuth admin = new UserAuth();
        admin.setEmail("admin-mgmt@auth.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRoles(java.util.Set.of(Role.ADMIN));
        admin.setActive(true);
        UserData adminData = new UserData();
        adminData.setUserName("admin-mgmt");
        adminData.setUser(admin);
        admin.setUserData(adminData);
        userRepository.saveAndFlush(admin);

        String adminToken = objectMapper.readValue(
            mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AuthenticationRequestDto("admin-mgmt@auth.com", "admin123"))))
                .andReturn().getResponse().getContentAsString(), 
            AuthenticationResponseDto.class).session().accessToken();

        // 2. Criar usuário para gerenciar
        UserAuth user = new UserAuth();
        user.setEmail("to-manage@auth.com");
        user.setPassword(passwordEncoder.encode("user123"));
        user.setRoles(java.util.Set.of(Role.USER));
        user.setActive(true);
        UserData userData = new UserData();
        userData.setUserName("to-manage");
        userData.setUser(user);
        user.setUserData(userData);
        userRepository.saveAndFlush(user);

        // 3. Listar usuários (Admin)
        mockMvc.perform(get("/v1/user")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.meta.pagination.totalItems").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));

        // 4. Desativar Usuário (Admin)
        mockMvc.perform(patch("/v1/user/deactivate")
                .header("Authorization", "Bearer " + adminToken)
                .param("id", user.getUserId().toString()))
                .andExpect(status().isNoContent());

        // 5. Tentativa de Login (Usuário Desativado) - Deve falhar (Spring Security cuida disso se configurado, ou o use case)
        // Nota: O LoginUseCase atual parece não checar active explicitamente, mas o Spring Security AuthenticationManager deve lançar DisabledException
        mockMvc.perform(post("/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AuthenticationRequestDto("to-manage@auth.com", "user123"))))
                .andExpect(status().isUnauthorized());

        // 6. Ativar Usuário (Admin)
        mockMvc.perform(patch("/v1/user/activate")
                .header("Authorization", "Bearer " + adminToken)
                .param("id", user.getUserId().toString()))
                .andExpect(status().isNoContent());

        // 7. Atualizar Perfil (Admin)
        com.auth.api.dto.auth.UpdateUserProfileRequestDto updateRequest = com.auth.api.dto.auth.UpdateUserProfileRequestDto.builder()
                .position("Senior Architect")
                .build();

        mockMvc.perform(patch("/v1/user/profile/" + user.getUserId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.position").value("Senior Architect"));
    }
}
