/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Paths;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.web.bind.annotation.RequestMapping;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";
    private static final String API_TITLE = "Auth API";
    private static final String API_VERSION = "1.0";
    private static final String API_DESCRIPTION = "API de Autenticação com JWT e UUIDv7";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(createApiInfo())
                .addSecurityItem(createSecurityRequirement())
                .components(createComponents());
    }

    @Bean
    public GroupedOpenApi v1Api() {
        return GroupedOpenApi.builder()
                .group("v1")
                .pathsToMatch("/v*/**")
                .addOpenApiMethodFilter(method -> {
                    RequestMapping classMapping = AnnotatedElementUtils.findMergedAnnotation(
                            method.getDeclaringClass(), RequestMapping.class);
                    RequestMapping methodMapping = AnnotatedElementUtils.findMergedAnnotation(
                            method, RequestMapping.class);
                    String version = (methodMapping != null && !methodMapping.version().isEmpty())
                            ? methodMapping.version()
                            : (classMapping != null
                               ? classMapping.version()
                                    : "");
                    return version.isEmpty() || version.equals("1");
                })
                .addOpenApiCustomizer(openApi -> {
                    if (openApi.getPaths() == null) return;
                    Paths resolvedPaths = new Paths();
                    openApi.getPaths().forEach((path, pathItem) ->
                            resolvedPaths.addPathItem(
                                    path.replaceAll("\\{version[^}]*}", "1"), pathItem));
                    openApi.setPaths(resolvedPaths);
                })
                .build();
    }

    @Bean
    public GroupedOpenApi v2Api() {
        return GroupedOpenApi.builder()
                .group("v2")
                .pathsToMatch("/v*/**")
                .addOpenApiMethodFilter(method -> {
                    RequestMapping methodMapping = AnnotatedElementUtils.findMergedAnnotation(
                            method, RequestMapping.class);
                    RequestMapping classMapping = AnnotatedElementUtils.findMergedAnnotation(
                            method.getDeclaringClass(), RequestMapping.class);
                    String version = (methodMapping != null && !methodMapping.version().isEmpty())
                            ? methodMapping.version()
                            : (classMapping != null
                               ? classMapping.version()
                                    : "");
                    return version.equals("2");
                })
                .addOpenApiCustomizer(openApi -> {
                    if (openApi.getPaths() == null) return;
                    Paths resolvedPaths = new Paths();
                    openApi.getPaths().forEach((path, pathItem) ->
                            resolvedPaths.addPathItem(
                                    path.replaceAll("\\{version[^}]*}", "2"), pathItem));
                    openApi.setPaths(resolvedPaths);
                })
                .build();
    }

    private Info createApiInfo() {
        return new Info()
                .title(API_TITLE)
                .version(API_VERSION)
                .description(API_DESCRIPTION);
    }

    private SecurityRequirement createSecurityRequirement() {
        return new SecurityRequirement().addList(SECURITY_SCHEME_NAME);
    }

    private Components createComponents() {
        return new Components().addSecuritySchemes(SECURITY_SCHEME_NAME, createSecurityScheme());
    }

    private SecurityScheme createSecurityScheme() {
        return new SecurityScheme()
                .name(SECURITY_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");
    }
}