/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.resend.Resend;
import com.resend.services.emails.Emails;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private Resend resend;

    @Mock
    private Emails emails;

    private EmailService emailService;
    private final String fromEmail = "test@example.com";
    private final String templateContent = "<html><body>Olá, {{username}}! Password: {{tempPassword}} <img src=\"data:image/png;base64,{{logoBase64}}\"></body></html>";
    private final byte[] logoBytes = new byte[]{1, 2, 3};

    @BeforeEach
    void setUp() {
        Resource emailTemplate = new ByteArrayResource(templateContent.getBytes());
        Resource logoResource = new ByteArrayResource(logoBytes);
        emailService = new EmailService(resend, fromEmail, emailTemplate, logoResource);
    }

    @Test
    @DisplayName("Deve carregar o template, substituir os placeholders incluindo o logo em Base64")
    void shouldLoadTemplateAndReplacePlaceholdersWithDataUriLogo() throws Exception {
        String toEmail = "user@example.com";
        String username = "Vinícius Gabriel";
        String tempPassword = "secret-password";
        String expectedLogoBase64 = Base64.getEncoder().encodeToString(logoBytes);
        
        CreateEmailResponse mockResponse = mock(CreateEmailResponse.class);
        when(resend.emails()).thenReturn(emails);
        when(mockResponse.getId()).thenReturn("email-id");
        when(emails.send(any(CreateEmailOptions.class))).thenReturn(mockResponse);

        emailService.sendResetPasswordEmail(toEmail, username, tempPassword);

        ArgumentCaptor<CreateEmailOptions> captor = ArgumentCaptor.forClass(CreateEmailOptions.class);
        verify(emails).send(captor.capture());

        CreateEmailOptions options = captor.getValue();
        assertEquals(fromEmail, options.getFrom());
        assertEquals(toEmail, options.getTo().get(0));
        assertTrue(options.getHtml().contains("Olá, Vinícius Gabriel!"));
        assertTrue(options.getHtml().contains("Password: secret-password"));
        assertTrue(options.getHtml().contains("data:image/png;base64," + expectedLogoBase64));
        assertFalse(options.getHtml().contains("{{username}}"));
        assertFalse(options.getHtml().contains("{{tempPassword}}"));
        assertFalse(options.getHtml().contains("{{logoBase64}}"));
    }

    @Test
    @DisplayName("Deve lançar exceção se o envio do email falhar")
    void shouldThrowExceptionWhenEmailSendingFails() throws Exception {
        when(resend.emails()).thenReturn(emails);
        when(emails.send(any(CreateEmailOptions.class))).thenThrow(new RuntimeException("API Error"));

        assertThrows(RuntimeException.class, () -> 
            emailService.sendResetPasswordEmail("user@example.com", "User", "pass")
        );
    }

    @Test
    @DisplayName("Deve lançar exceção se houver erro ao carregar o template")
    void shouldThrowExceptionWhenTemplateLoadingFails() throws IOException {
        Resource failingTemplate = mock(Resource.class);
        Resource logoResource = new ByteArrayResource(logoBytes);
        when(failingTemplate.getInputStream()).thenThrow(new IOException("File not found"));
        
        EmailService failingService = new EmailService(resend, fromEmail, failingTemplate, logoResource);

        assertThrows(RuntimeException.class, () -> 
            failingService.sendResetPasswordEmail("user@example.com", "User", "pass")
        );
    }
}
