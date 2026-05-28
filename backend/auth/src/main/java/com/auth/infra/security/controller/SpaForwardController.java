/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Fallback Controller para rotas da SPA.
 * Substitui o uso de Redirect (302) pelo uso de Forward, mantendo o backend
 * stateless e delegando a responsabilidade de navegação visual ao Frontend (React).
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = "/{path:[^\\.]*}")
    public Object forward() {
        // Verifica se o index.html existe para evitar Erro 500 (FileNotFoundException)
        if (!new ClassPathResource("static/index.html").exists()) {
            return ResponseEntity.status(503).body("Sistema em manutenção ou recursos estáticos ausentes. Por favor, tente mais tarde.");
        }
        return "forward:/index.html";
    }
}
