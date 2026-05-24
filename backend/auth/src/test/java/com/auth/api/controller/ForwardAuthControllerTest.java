package com.auth.api.controller;

import com.auth.application.service.CookieService;
import com.auth.application.usecase.VerifyAuthUseCase;
import com.auth.infra.security.service.JwtGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import jakarta.servlet.http.Cookie;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class ForwardAuthControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private VerifyAuthUseCase verifyAuthUseCase;

    @MockitoBean
    private JwtGeneratorService jwtService;

    @MockitoBean
    private CookieService cookieService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve retornar 200 quando access_token no cookie é válido")
    void shouldReturnOkWhenAccessTokenInCookieIsValid() throws Exception {
        String token = "valid-token";
        when(jwtService.isTokenValid(token)).thenReturn(true);

        mockMvc.perform(get("/v1/auth/verify")
                .cookie(new Cookie("access_token", token)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve retornar 200 quando Authorization header é válido e cookie ausente")
    void shouldReturnOkWhenAuthHeaderIsValid() throws Exception {
        String token = "valid-token";
        when(jwtService.isTokenValid(token)).thenReturn(true);

        mockMvc.perform(get("/v1/auth/verify")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve renovar silenciosamente quando access_token expira mas refresh_token é válido")
    void shouldRenewSilentlyWhenAccessTokenIsInvalidButRefreshTokenIsValid() throws Exception {
        String oldToken = "expired-token";
        String refreshToken = "valid-refresh";
        String newToken = "new-access-token";

        when(jwtService.isTokenValid(oldToken)).thenReturn(false);
        when(verifyAuthUseCase.execute(refreshToken)).thenReturn(newToken);
        
        ResponseCookie newCookie = ResponseCookie.from("access_token", newToken).build();
        when(cookieService.buildAccessTokenCookie(newToken)).thenReturn(newCookie);

        mockMvc.perform(get("/v1/auth/verify")
                .cookie(new Cookie("access_token", oldToken), new Cookie("refresh_token", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.AUTHORIZATION, "Bearer " + newToken));
        
        verify(verifyAuthUseCase).execute(refreshToken);
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve redirecionar para login quando tokens são ausentes")
    void shouldRedirectToLoginWhenTokensAreMissing() throws Exception {
        mockMvc.perform(get("/v1/auth/verify")
                .header("X-Forwarded-Proto", "https")
                .header("X-Forwarded-Host", "myapp.com")
                .header("X-Forwarded-Uri", "/dashboard"))
                .andExpect(status().isFound())
                .andExpect(header().string(HttpHeaders.LOCATION, containsString("/login?redirectUri=https%3A%2F%2Fmyapp.com%2Fdashboard")));
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve redirecionar para login quando renovação falha")
    void shouldRedirectToLoginWhenRenewalFails() throws Exception {
        String oldToken = "invalid";
        String refreshToken = "invalid-refresh";

        when(jwtService.isTokenValid(anyString())).thenReturn(false);
        when(verifyAuthUseCase.execute(refreshToken)).thenThrow(new RuntimeException("Invalid refresh token"));

        mockMvc.perform(get("/v1/auth/verify")
                .cookie(new Cookie("access_token", oldToken), new Cookie("refresh_token", refreshToken)))
                .andExpect(status().isFound());
    }
}
