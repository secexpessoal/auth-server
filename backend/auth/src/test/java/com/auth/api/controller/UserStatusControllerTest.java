/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.api.controller;

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

import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@ActiveProfiles("test")
class UserStatusControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private UserService userService;

@BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("Deve retornar 204 ao ativar usuário com sucesso")
    @WithMockUser(roles = "ADMIN")
    void deveRetornar204AoAtivarUsuario() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/v1/user/activate")
                .param("id", id.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(userService).updateStatus(id, true);
    }

    @Test
    @DisplayName("Deve retornar 204 ao desativar usuário com sucesso")
    @WithMockUser(roles = "ADMIN")
    void deveRetornar204AoDesativarUsuario() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/v1/user/deactivate")
                .param("id", id.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(userService).updateStatus(id, false);
    }

    @Test
    @DisplayName("Deve retornar 400 ao atualizar perfil com campos obrigatórios nulos")
    @WithMockUser(roles = "ADMIN")
    void deveRetornar400AoAtualizarPerfilComCamposNulos() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/v1/user/profile/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "username": "Sap",
                          "registration": null,
                          "position": null,
                          "birthDate": null,
                          "livesElsewhere": false,
                          "inPersonWorkPeriod": null,
                          "workRegime": null
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }
}
