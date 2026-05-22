package com.auth.application.usecase;

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
class VerifyAuthUseCaseTest {

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private JwtGeneratorService jwtService;

    @InjectMocks
    private VerifyAuthUseCase verifyAuthUseCase;

    @Test
    @DisplayName("Deve lançar exceção quando o token for nulo")
    void shouldThrowWhenTokenIsNull() {
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> verifyAuthUseCase.execute(null)
        );

        assertEquals("O token é inválido ou ausente.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando o usuário estiver inativo")
    void shouldThrowWhenUserIsInactive() {
        // Arrange
        String tokenString = "valid-token-string";
        RefreshToken token = new RefreshToken();
        UserAuth user = new UserAuth();
        user.setActive(false);
        token.setUser(user);

        when(refreshTokenService.findByToken(tokenString)).thenReturn(token);
        when(refreshTokenService.verifyExpiration(token)).thenReturn(token);

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> verifyAuthUseCase.execute(tokenString)
        );

        assertEquals("O token é inválido ou o usuário está inativo.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve retornar JWT novo quando o token e usuário forem válidos")
    void shouldReturnJwtWhenTokenIsValid() {
        // Arrange
        String tokenString = "valid-token-string";
        RefreshToken token = new RefreshToken();
        UserAuth user = new UserAuth();
        user.setActive(true);
        token.setUser(user);

        when(refreshTokenService.findByToken(tokenString)).thenReturn(token);
        when(refreshTokenService.verifyExpiration(token)).thenReturn(token);
        when(jwtService.generateToken(user)).thenReturn("new-jwt-token");

        // Act
        String result = verifyAuthUseCase.execute(tokenString);

        // Assert
        assertEquals("new-jwt-token", result);
        verify(jwtService).generateToken(user);
    }
}
