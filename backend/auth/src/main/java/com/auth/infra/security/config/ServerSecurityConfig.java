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
import com.auth.infra.security.filter.CsrfCookieFilter;
import com.auth.infra.security.filter.JwtAuthenticationFilter;
import com.auth.infra.security.filter.MdcFilter;
import com.auth.infra.security.filter.PasswordResetFilter;
import com.auth.infra.security.filter.RateLimitingFilter;
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
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class ServerSecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtGeneratorService jwtGeneratorService;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final RateLimitingFilter rateLimitingFilter;
    private final MdcFilter mdcFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        CsrfTokenRequestAttributeHandler csrftokenrequestattributehandler = new CsrfTokenRequestAttributeHandler();

        JwtAuthenticationFilter jwtAuthFilter = new JwtAuthenticationFilter(jwtGeneratorService, userDetailsService);
        PasswordResetFilter passwordResetFilter = new PasswordResetFilter();
        CsrfCookieFilter csrfCookieFilter = new CsrfCookieFilter();

        httpSecurity
                .addFilterBefore(mdcFilter, UsernamePasswordAuthenticationFilter.class) // NOTE: MDC em primeiro para rastrear tudo
                .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // NOTE: Permite o JS ler o cookie XSRF-TOKEN
                        .csrfTokenRequestHandler(csrftokenrequestattributehandler)
                        .requireCsrfProtectionMatcher(new CsrfProtectionMatcher())

                        // NOTE: Ignorar endpoints públicos que não exigem proteção CSRF (normalmente login/registro se forem POST)
                        .ignoringRequestMatchers("/v1/user/login", "/v1/user/refresh")
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests((matcherRegistry) -> {
                    matcherRegistry
                            .requestMatchers(HttpMethod.GET, "/v1/user").hasRole(Role.ADMIN.name())
                            .requestMatchers("/v1/user/login", "/v1/user/logout", "/v1/user/refresh").permitAll()
                            .requestMatchers("/v1/user/register/**", "/v1/password/admin-reset").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.PATCH, "/v1/user/activate", "/v1/user/deactivate").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.PATCH, "/v1/user/*/roles").hasRole(Role.ADMIN.name())
                            .requestMatchers("/v1/password/change", "/v1/user/profile/**", "/v1/password/first-change").authenticated()

                            // NOTE: Swagger
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                            // NOTE: Roteamento SPA: permitir todas as solicitações GET que não sejam endpoints de API (assets, html, rotas SPA)
                            .requestMatchers(HttpMethod.GET, "/**").permitAll()
                            .anyRequest().authenticated();
                })
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(passwordResetFilter, JwtAuthenticationFilter.class)
                .addFilterAfter(csrfCookieFilter, JwtAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return httpSecurity.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    private static class CsrfProtectionMatcher implements RequestMatcher {
        private final Set<String> allowedMethods = Set.of("GET", "HEAD", "TRACE", "OPTIONS");

        @Override
        public boolean matches(HttpServletRequest request) {
            if (allowedMethods.contains(request.getMethod())) return false;

            String authHeader = request.getHeader("Authorization");
            return authHeader == null || !authHeader.startsWith("Bearer ");
        }
    }
}