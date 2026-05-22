package com.auth.application.usecase;

import com.auth.application.service.RefreshTokenService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VerifyAuthUseCase {
    private final RefreshTokenService refreshTokenService;
    private final JwtGeneratorService jwtService;

    public String execute(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "O token é inválido ou ausente.");
        }
        
        RefreshToken token = refreshTokenService.findByToken(refreshToken);
        refreshTokenService.verifyExpiration(token);
        
        UserAuth userAuth = token.getUser();
        if (!Boolean.TRUE.equals(userAuth.getActive())) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "O token é inválido ou o usuário está inativo.");
        }
        
        return jwtService.generateToken(userAuth);
    }
}
