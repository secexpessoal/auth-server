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
import com.auth.infra.security.filter.PasswordResetFilter;
import com.auth.infra.security.handler.CustomAccessDeniedHandler;
import com.auth.infra.security.handler.CustomAuthenticationEntryPoint;
import com.auth.infra.security.service.JwtGeneratorService;
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

@Configuration
@RequiredArgsConstructor
public class ServerSecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtGeneratorService jwtGeneratorService;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        CsrfTokenRequestAttributeHandler csrftokenrequestattributehandler = new CsrfTokenRequestAttributeHandler();

        JwtAuthenticationFilter jwtAuthFilter = new JwtAuthenticationFilter(jwtGeneratorService, userDetailsService);
        PasswordResetFilter passwordResetFilter = new PasswordResetFilter();
        CsrfCookieFilter csrfCookieFilter = new CsrfCookieFilter();


        httpSecurity
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // NOTE: Permite o JS ler o cookie XSRF-TOKEN
                        .csrfTokenRequestHandler(csrftokenrequestattributehandler)

                        // NOTE: Ignorar endpoints públicos que não exigem proteção CSRF (normalmente login/registro se forem POST)
                        .ignoringRequestMatchers("/v1/user/login")
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests((matcherRegistry) -> {
                    matcherRegistry
                            // Public API Matchers
                            .requestMatchers("/v1/user/login").permitAll()
                            .requestMatchers("/v1/user/logout").permitAll()
                            .requestMatchers("/v1/user/refresh").permitAll()

                            // NOTE: Precisa estar autenticado
                            .requestMatchers("/v1/password/change").authenticated()
                            .requestMatchers("/v1/user/profile/**").authenticated()
                            .requestMatchers("/v1/password/first-change").authenticated()

                            // NOTE: Precisa de Admin
                            .requestMatchers("/v1/user/register").hasRole(Role.ADMIN.name())
                            .requestMatchers("/v1/user/register/admin").hasRole(Role.ADMIN.name())
                            .requestMatchers("/v1/password/admin-reset").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.GET, "/v1/user").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.PATCH, "/v1/user/activate").hasRole(Role.ADMIN.name())
                            .requestMatchers(HttpMethod.PATCH, "/v1/user/deactivate").hasRole(Role.ADMIN.name())

                            // NOTE: Swagger
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                            // NOTE: Roteamento SPA: permitir todas as solicitações GET que não sejam endpoints de API (assets, html, rotas SPA)
                            .requestMatchers(HttpMethod.GET, "/**").permitAll()
                            .anyRequest().authenticated();
                })
                .addFilterAfter(passwordResetFilter, JwtAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(csrfCookieFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return httpSecurity.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
