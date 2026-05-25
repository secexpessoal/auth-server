package com.auth.application.usecase;

import com.auth.application.dto.VerifyAuthResult;
import com.auth.application.service.RefreshTokenService;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.UserAuth;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerifyAuthUseCase {
    private final RefreshTokenService refreshTokenService;
    private final JwtGeneratorService jwtService;

    public VerifyAuthResult execute(String refreshToken, String userAgent, String ipAddress, String origin, String referer) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "O token é inválido ou ausente.");
        }
        
        RefreshToken token = refreshTokenService.findByToken(refreshToken);
        refreshTokenService.verifyExpiration(token);
        
        // Validação de segurança: Metadados
        validateMetadata(token, userAgent, ipAddress);
        
        UserAuth userAuth = token.getUser();
        if (!Boolean.TRUE.equals(userAuth.getActive())) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "O token é inválido ou o usuário está inativo.");
        }
        
        String newAccessToken = jwtService.generateToken(userAuth);
        
        // Rotação de Refresh Token: Deleta o antigo e cria um novo
        refreshTokenService.deleteByToken(refreshToken);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(userAuth, userAgent, ipAddress, origin, referer);
        
        log.info("Renovação silenciosa concluída para usuário: {}. Novo Refresh Token gerado.", userAuth.getEmail());
        
        return new VerifyAuthResult(newAccessToken, newRefreshToken.getToken());
    }

    private void validateMetadata(RefreshToken token, String userAgent, String ipAddress) {
        // Se o IP ou UserAgent mudarem drasticamente, invalidamos a tentativa de renovação
        if (token.getUserAgent() != null && !token.getUserAgent().equals(userAgent)) {
            log.warn("Tentativa de renovação com User-Agent diferente! Esperado: {}, Recebido: {}", token.getUserAgent(), userAgent);
            // Opcional: deletar o token suspeito
            refreshTokenService.deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (User-Agent divergente).");
        }

        // Validação de IP (Pode ser mais permissiva dependendo da rede, mas aqui seremos estritos por padrão)
        if (token.getIpAddress() != null && !token.getIpAddress().equals(ipAddress)) {
            log.warn("Tentativa de renovação com IP diferente! Esperado: {}, Recebido: {}", token.getIpAddress(), ipAddress);
            refreshTokenService.deleteByToken(token.getToken());
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Segurança da sessão comprometida (IP divergente).");
        }
    }
}
