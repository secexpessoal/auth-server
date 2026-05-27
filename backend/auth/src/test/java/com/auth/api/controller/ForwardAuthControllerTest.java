package com.auth.api.controller;

import com.auth.application.payload.AuthMetadata;
import com.auth.application.payload.VerifyAuthResult;
import com.auth.application.payload.VerifyAuthStatus;
import com.auth.application.service.CookieService;
import com.auth.application.service.RefreshTokenService;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
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

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
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
    private RefreshTokenService refreshTokenService;

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
        
        VerifyAuthResult result = VerifyAuthResult.builder()
                .status(VerifyAuthStatus.AUTHORIZED)
                .accessToken(token)
                .build();

        when(refreshTokenService.verifyAuth(eq(token), any(), any(AuthMetadata.class))).thenReturn(result);

        mockMvc.perform(get("/v1/auth/verify")
                .cookie(new Cookie("access_token", token)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve retornar 200 quando Authorization header é válido e cookie ausente")
    void shouldReturnOkWhenAuthHeaderIsValid() throws Exception {
        String token = "valid-token";
        
        VerifyAuthResult result = VerifyAuthResult.builder()
                .status(VerifyAuthStatus.AUTHORIZED)
                .accessToken(token)
                .build();

        when(refreshTokenService.verifyAuth(eq(token), any(), any(AuthMetadata.class))).thenReturn(result);

        mockMvc.perform(get("/v1/auth/verify")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve renovar silenciosamente com rotação quando access_token expira mas refresh_token é válido")
    void shouldRenewSilentlyWithRotationWhenAccessTokenIsInvalidButRefreshTokenIsValid() throws Exception {
        String oldToken = "expired-token";
        String refreshToken = "valid-refresh";
        String newToken = "new-access-token";
        String newRefreshToken = "new-refresh-token";
        String userAgent = "Mozilla/5.0";

        VerifyAuthResult result = VerifyAuthResult.builder()
                .status(VerifyAuthStatus.RENEWED)
                .accessToken(newToken)
                .refreshToken(newRefreshToken)
                .build();

        when(refreshTokenService.verifyAuth(eq(oldToken), eq(refreshToken), any(AuthMetadata.class)))
                .thenReturn(result);
        
        ResponseCookie newAccessCookie = ResponseCookie.from("access_token", newToken).build();
        ResponseCookie newRefreshCookie = ResponseCookie.from("refresh_token", newRefreshToken).build();
        
        when(cookieService.buildAuthCookies(anyString(), anyString())).thenReturn(List.of(newRefreshCookie, newAccessCookie));

        mockMvc.perform(get("/v1/auth/verify")
                .header(HttpHeaders.USER_AGENT, userAgent)
                .cookie(new Cookie("access_token", oldToken), new Cookie("refresh_token", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().value("access_token", newToken))
                .andExpect(cookie().value("refresh_token", newRefreshToken))
                .andExpect(header().string(HttpHeaders.AUTHORIZATION, "Bearer " + newToken));
    }

    @Test
    @DisplayName("GET /v1/auth/verify - Deve redirecionar para login quando tokens são ausentes")
    void shouldRedirectToLoginWhenTokensAreMissing() throws Exception {
        VerifyAuthResult result = VerifyAuthResult.builder()
                .status(VerifyAuthStatus.UNAUTHORIZED)
                .build();

        when(refreshTokenService.verifyAuth(any(), any(), any(AuthMetadata.class))).thenReturn(result);

        mockMvc.perform(get("/v1/auth/verify")
                .header("X-Forwarded-Proto", "https")
                .header("X-Forwarded-Host", "myapp.com")
                .header("X-Forwarded-Uri", "/dashboard"))
                .andExpect(status().isFound())
                .andExpect(header().string(HttpHeaders.LOCATION, containsString("/login?redirectUri=https%3A%2F%2Fmyapp.com%2Fdashboard")));
    }
}
