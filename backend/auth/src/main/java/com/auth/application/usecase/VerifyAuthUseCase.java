package com.auth.application.usecase;

import com.auth.application.service.RefreshTokenService;
import com.auth.domain.model.RefreshToken;
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
        return Optional.ofNullable(refreshToken)
                .map(refreshTokenService::findByToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .filter(userAuth -> Boolean.TRUE.equals(userAuth.getActive()))
                .map(jwtService::generateToken)
                .orElse(null);
    }
}
