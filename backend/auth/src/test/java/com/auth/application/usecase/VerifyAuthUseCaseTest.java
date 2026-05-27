package com.auth.application.usecase;

import com.auth.application.dto.VerifyAuthResult;
import com.auth.application.service.RefreshTokenService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerifyAuthUseCas {

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private JwtGeneratorService jwtService;

    @InjectMocks
    private AuthUseCase authUseCase;

    @Test
    @DisplayName("Deve lançar exceção quando o token for nulo")
    void shouldThrowWhenTokenIsNull() {
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authUseCase.verifyAuth(null, "ua", "ip", null, null)
        );

        assertEquals("O token é inválido ou ausente.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando o usuário estiver inativo")
    void shouldThrowWhenUserIsInactive() {
        // Arrange
        String tokenString = "valid-token-string";
        String ua = "Mozilla/5.0";
        String ip = "127.0.0.1";
        
        RefreshToken token = new RefreshToken();
        token.setToken(tokenString);
        token.setUserAgent(ua);
        token.setIpAddress(ip);
        
        UserAuth user = new UserAuth();
        user.setActive(false);
        token.setUser(user);

        when(refreshTokenService.findByToken(tokenString)).thenReturn(token);
        when(refreshTokenService.verifyExpiration(token)).thenReturn(token);

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authUseCase.verifyAuth(tokenString, ua, ip, null, null)
        );

        assertEquals("O token é inválido ou o usuário está inativo.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve retornar JWT e RefreshToken novos quando o token e usuário forem válidos")
    void shouldReturnTokensWhenValid() {
        // Arrange
        String tokenString = "old-refresh";
        String ua = "Mozilla/5.0";
        String ip = "127.0.0.1";
        
        RefreshToken oldToken = new RefreshToken();
        oldToken.setToken(tokenString);
        oldToken.setUserAgent(ua);
        oldToken.setIpAddress(ip);
        
        UserAuth user = new UserAuth();
        user.setActive(true);
        user.setEmail("user@test.com");
        oldToken.setUser(user);

        RefreshToken newToken = new RefreshToken();
        newToken.setToken("new-refresh");

        when(refreshTokenService.findByToken(tokenString)).thenReturn(oldToken);
        when(refreshTokenService.verifyExpiration(oldToken)).thenReturn(oldToken);
        when(jwtService.generateToken(user)).thenReturn("new-jwt");
        when(refreshTokenService.createRefreshToken(eq(user), eq(ua), eq(ip), any(), any())).thenReturn(newToken);

        // Act
        VerifyAuthResult result = authUseCase.verifyAuth(tokenString, ua, ip, null, null);

        // Assert
        assertEquals("new-jwt", result.accessToken());
        assertEquals("new-refresh", result.refreshToken());
        
        verify(refreshTokenService).deleteByToken(tokenString);
        verify(refreshTokenService).createRefreshToken(eq(user), eq(ua), eq(ip), any(), any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando o User-Agent for divergente")
    void shouldThrowWhenUserAgentDiffers() {
        // Arrange
        String tokenString = "valid-token";
        RefreshToken token = new RefreshToken();
        token.setToken(tokenString);
        token.setUserAgent("Mozilla/5.0");
        token.setIpAddress("127.0.0.1");

        when(refreshTokenService.findByToken(tokenString)).thenReturn(token);

        // Act & Assert
        assertThrows(
                BadRequestException.class,
                () -> authUseCase.verifyAuth(tokenString, "Attacker-Agent", "127.0.0.1", null, null)
        );
        
        verify(refreshTokenService).deleteByToken(tokenString);
    }
}
