/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.config;

import com.auth.application.service.CustomUserDetailsService;
import com.auth.domain.model.Role;
import com.auth.infra.security.filter.*;
import com.auth.infra.security.handler.CustomAccessDeniedHandler;
import com.auth.infra.security.handler.CustomAuthenticationEntryPoint;
import com.auth.infra.security.service.JwtGeneratorService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.CrossOriginOpenerPolicyHeaderWriter.CrossOriginOpenerPolicy;
import org.springframework.security.web.header.writers.CrossOriginResourcePolicyHeaderWriter.CrossOriginResourcePolicy;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.util.AntPathMatcher;

import java.util.Arrays;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class ServerSecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtGeneratorService jwtGeneratorService;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final RateLimitingFilter rateLimitingFilter;
    private final MappedDiagnosticContextFilter mappedDiagnosticContextFilter;
    private final SsoRedirectFilter ssoRedirectFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        CsrfTokenRequestAttributeHandler csrftokenrequestattributehandler = new CsrfTokenRequestAttributeHandler();

        JwtAuthenticationFilter jwtAuthFilter = new JwtAuthenticationFilter(jwtGeneratorService, userDetailsService);
        PasswordResetFilter passwordResetFilter = new PasswordResetFilter();
        CsrfCookieFilter csrfCookieFilter = new CsrfCookieFilter();

        httpSecurity
                .addFilterBefore(mappedDiagnosticContextFilter, UsernamePasswordAuthenticationFilter.class) // NOTE: MDC em primeiro para rastrear tudo
                .addFilterAfter(ssoRedirectFilter, MappedDiagnosticContextFilter.class)
                .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // NOTE: Permite o JS ler o cookie XSRF-TOKEN
                        .csrfTokenRequestHandler(csrftokenrequestattributehandler)
                        .requireCsrfProtectionMatcher(new CsrfProtectionMatcher())

                        // NOTE: Ignorar endpoints públicos que não exigem proteção CSRF
                        .ignoringRequestMatchers("/v*/user/login", "/v*/user/refresh", "/v*/user/logout", "/v1/password/user-reset")
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests((matcherRegistry) -> {
                    matcherRegistry
                            .requestMatchers("/v*/user/login", "/v*/user/logout", "/v*/user/refresh", "/v1/password/user-reset").permitAll()
                            .requestMatchers("/v*/auth/verify").permitAll()
                            .requestMatchers(HttpMethod.GET, "/v*/user").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.PATCH, "/v*/user/*/roles").hasRole(Role.ADMIN.name())
                            .requestMatchers("/v*/user/register/**", "/v1/password/admin-reset").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.PATCH, "/v*/user/activate", "/v*/user/deactivate").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.GET, "/v*/positions/active").authenticated()
                            .requestMatchers("/v*/positions/**", "/v*/user/positions/**").hasRole(Role.ADMIN.name())
                            .requestMatchers("/v1/password/change", "/v*/user/profile/**", "/v1/password/first-change").authenticated()

                            // NOTE: Swagger — restrito apenas para ADMIN
                            .requestMatchers(
                                    "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml")
                            .hasRole(Role.ADMIN.name())

                            // NOTE: Roteamento SPA: permitir todas as solicitações GET que não sejam endpoints de API (assets, html, rotas SPA)
                            // IMPORTANTE: esta regra vem DEPOIS das regras específicas (Swagger, etc.) para não sobrepô-las.
                            .requestMatchers(HttpMethod.GET, "/**").permitAll()
                            .anyRequest().authenticated();
                })
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(passwordResetFilter, JwtAuthenticationFilter.class)
                .addFilterAfter(csrfCookieFilter, JwtAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> {
                    headers.httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000));
                    headers.contentSecurityPolicy(csp -> csp.policyDirectives(
                            "default-src 'self'; script-src 'self' 'unsafe-inline' chrome-extension: moz-extension:; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;"));
                    headers.referrerPolicy(referrer -> referrer
                            .policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                    headers.permissionsPolicyHeader(permissions -> permissions
                            .policy("camera=(), geolocation=(), microphone=(), payment=()"));
                    headers.crossOriginOpenerPolicy(coop -> coop
                            .policy(CrossOriginOpenerPolicy.SAME_ORIGIN));
                    headers.crossOriginResourcePolicy(corp -> corp
                            .policy(CrossOriginResourcePolicy.SAME_ORIGIN));
                });

        return httpSecurity.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    private static class CsrfProtectionMatcher implements RequestMatcher {
        private final Set<String> allowedMethods = Set.of("GET", "HEAD", "TRACE", "OPTIONS");
        private final AntPathMatcher pathMatcher = new AntPathMatcher();
        private final Set<String> publicRoutes = Set.of(
                "/v*/user/login",
                "/v*/user/refresh",
                "/v*/user/logout",
                "/v1/password/user-reset"
        );

        @Override
        public boolean matches(HttpServletRequest request) {
            if (allowedMethods.contains(request.getMethod())) return false;

            String path = request.getRequestURI();
            if (publicRoutes.stream().anyMatch(pattern -> pathMatcher.match(pattern, path))) return false;

            // Se tem Bearer Token, podemos ignorar CSRF (Bearer não é automático)
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return false;
            }

            // Se existe o cookie de access_token e não tem Bearer, DEVEMOS aplicar CSRF, 
            // pois o navegador enviará esse cookie automaticamente.
            return request.getCookies() != null &&
                   Arrays.stream(request.getCookies())
                           .anyMatch(cookie -> "access_token".equals(cookie.getName()));
        }
    }
}
