/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;

/**
 * Serviço responsável pela validação de URLs de redirecionamento.
 */
@Slf4j
@Service
public class RedirectService {

    @Value("${app.base-domain}")
    private String baseDomain;

    /**
     * Valida se uma URI de redirecionamento é permitida baseada no domínio configurado.
     *
     * @param redirectUri A URI a ser validada.
     * @return A URI validada ou null se for vazia.
     * @throws BadRequestException se a URI não for permitida.
     */
    public String validateRedirectUri(String redirectUri) {
        if (redirectUri == null || redirectUri.isBlank()) {
            return null;
        }

        try {
            URI uri = URI.create(redirectUri);
            String uriHost = uri.getHost();
            
            // Se for uma URL relativa (sem host), permitimos (redirecionamento interno)
            if (uriHost == null) {
                return redirectUri;
            }

            if (baseDomain != null && !baseDomain.isBlank() && 
               (uriHost.equals(baseDomain) || uriHost.endsWith(String.format(".%s", baseDomain)))) {
                return redirectUri;
            }
        } catch (Exception exception) {
            log.warn("Falha ao analisar URL de redirecionamento: {}", redirectUri, exception);
        }

        throw new BadRequestException(ErrorCode.BAD_REQUEST, "O site que você quer acessar não é permitido.");
    }
}
