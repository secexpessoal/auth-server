/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {
        // Define que a versão será extraída do primeiro segmento do path (v1, v2, etc)
        configurer.usePathSegment(0)
                  .addSupportedVersions("1", "2")
                  .setVersionRequired(true);
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Adiciona automaticamente o prefixo /v{version} para todos os controllers
        // Isso permite remover o /v1/ ou /v2/ manual do @RequestMapping
        configurer.addPathPrefix("/v{version}", c -> true);
    }
}
