/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Service
public class EmailService {

    private final Resend resend;
    private final String fromEmail;

    @Value("classpath:templates/email.html")
    private Resource emailTemplate;

    @Value("classpath:templates/TCM.png")
    private Resource logoResource;

    @Autowired
    public EmailService(
            @Value("${resend.api.key}") String apiKey,
            @Value("${resend.from.email}") String fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    EmailService(Resend resend, String fromEmail, Resource emailTemplate, Resource logoResource) {
        this.resend = resend;
        this.fromEmail = fromEmail;
        this.emailTemplate = emailTemplate;
        this.logoResource = logoResource;
    }

    public void sendResetPasswordEmail(String toEmail, String username, String tempPassword) {
        try {
            byte[] logoBytes = StreamUtils.copyToByteArray(logoResource.getInputStream());
            String logoBase64 = Base64.getEncoder().encodeToString(logoBytes);

            String htmlContent = StreamUtils.copyToString(emailTemplate.getInputStream(), StandardCharsets.UTF_8);
            htmlContent = htmlContent
                    .replace("{{username}}", username)
                    .replace("{{tempPassword}}", tempPassword)
                    .replace("{{logoBase64}}", logoBase64);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(toEmail)
                    .subject("Recuperação de Senha - Auth Service")
                    .html(htmlContent)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            log.info("Email de reset de senha enviado com sucesso para {}. ID: {}", toEmail, response.getId());
        } catch (ResendException resendException) {
            log.error("Erro ao enviar email de reset de senha para {}: {}", toEmail, resendException.getMessage());
            throw new RuntimeException("Falha ao enviar e-mail de recuperação", resendException);
        } catch (Exception exception) {
            log.error("Erro ao processar template de email para {}: {}", toEmail, exception.getMessage());
            throw new RuntimeException("Falha ao processar e-mail de recuperação", exception);
        }
    }
}
