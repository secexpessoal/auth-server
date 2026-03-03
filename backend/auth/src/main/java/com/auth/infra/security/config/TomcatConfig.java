/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.config;

import com.auth.infra.exception.DataObjectError;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.catalina.connector.Request;
import org.apache.catalina.connector.Response;
import org.apache.catalina.valves.ErrorReportValve;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.server.servlet.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.Date;
import java.util.UUID;

@Configuration
public class TomcatConfig implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        if (factory instanceof TomcatServletWebServerFactory tomcatFactory) {
            tomcatFactory.addContextCustomizers(context -> {
                org.apache.catalina.Container parent = context.getParent();
                if (parent instanceof org.apache.catalina.core.StandardHost host) {
                    host.setErrorReportValveClass(CustomErrorReportValve.class.getName());
                }
            });
        }
    }

    public static class CustomErrorReportValve extends ErrorReportValve {
        private final ObjectMapper objectMapper = new ObjectMapper();

        public CustomErrorReportValve() {
            super();
        }

        @Override
        protected void report(Request request, Response response, Throwable throwable) {
            int statusCode = response.getStatus();
            if (statusCode < 400 || response.isCommitted()) {
                return;
            }

            try {
                // If the error happens before Spring security MDC population, we generate a traceId here
                String traceId = UUID.randomUUID().toString();

                String uri = request.getRequestURI();
                if (uri == null) {
                    uri = "Unknown Path";
                }

                boolean isApiRoute = uri.startsWith("/v1/");
                if (!isApiRoute) {
                    response.setContentType("text/html");
                    response.setCharacterEncoding("UTF-8");
                    response.setStatus(statusCode);
                    // Usando HTML string em vez de sendRedirect porque o Tomcat bloqueia redirect
                    // quando a requisição é severamente malformada (ex: caracteres `[]` soltos na URI).
                    String html = "<html><head><meta http-equiv=\"refresh\" content=\"0;url=/?error_code=" + statusCode + "\"></head><body></body></html>";
                    response.getWriter().write(html);
                    response.getWriter().flush();
                    return;
                }

                String displayMessage = switch(statusCode) {
                     case 400 -> "A requisição enviada possui formato ou caracteres inválidos.";
                     case 404 -> "O recurso solicitado não foi encontrado.";
                     default -> "Ocorreu um erro na camada do Servidor Web.";
                };

                DataObjectError error = DataObjectError.builder()
                        .timestamp(new Date())
                        .status(statusCode)
                        .error(org.springframework.http.HttpStatus.valueOf(statusCode).getReasonPhrase())
                        .code("SERVER_HTTP_ERROR")
                        .message(displayMessage)
                        .path(uri)
                        .traceId(traceId)
                        .build();

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                
                String jsonResponse = objectMapper.writeValueAsString(error);
                response.getWriter().write(jsonResponse);
                response.getWriter().flush();

            } catch (IOException e) {
                // Falha silenciosa ou log genérico caso não possamos escrever
            }
        }
    }
}
