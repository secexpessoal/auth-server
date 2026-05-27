/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.config;

import jakarta.annotation.Nonnull;
import jakarta.servlet.http.HttpServletRequest;
import org.jspecify.annotations.Nullable;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Controller;
import org.springframework.web.accept.ApiVersionParser;
import org.springframework.web.accept.ApiVersionResolver;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Set;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {
        configurer
                .addSupportedVersions("1", "2")
                .setDefaultVersion("1")
                .setVersionRequired(false)
                .useVersionResolver(new PathVersionResolver())
                .setVersionParser(new StripPrefixVersionParser());
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/v{version}",
                HandlerTypePredicate.forAnnotation(RestController.class)
                        .and(HandlerTypePredicate.forBasePackage("org.springdoc").negate())
                        .and(HandlerTypePredicate.forBasePackage("com.auth"))
        );
    }

    private static class PathVersionResolver implements ApiVersionResolver {

        private static final Set<String> SUPPORTED_VERSIONS = Set.of("1", "2");

        @Override
        @Nullable
        public String resolveVersion(@Nonnull HttpServletRequest request) {
            String uri = request.getRequestURI();
            if (!uri.startsWith("/v")) return null;

            int slashIndex = uri.indexOf('/', 2);
            if (slashIndex == -1) return null;

            String candidate = uri.substring(2, slashIndex);
            return SUPPORTED_VERSIONS.contains(candidate)
                    ? candidate
                    : null;
        }
    }

    private static class StripPrefixVersionParser implements ApiVersionParser<String> {
        @Override
        @Nonnull
        public String parseVersion(@Nonnull String version) {
            String numericVersion = version.startsWith("v") || version.startsWith("V")
                    ? version.substring(1)
                    : version;

            int dot = numericVersion.indexOf('.');

            return dot == -1
                    ? numericVersion
                    : numericVersion.substring(0, dot);
        }
    }
}