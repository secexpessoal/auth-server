/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.usecase;

import com.auth.api.dto.password.ChangePasswordRequestDto;
import com.auth.api.dto.password.FirstChangePasswordRequestDto;
import com.auth.api.dto.password.ResetPasswordRequestDto;
import com.auth.application.service.UserService;
import com.auth.domain.model.User;
import com.auth.domain.repository.UserRepository;
import com.auth.infra.exception.custom.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordUseCaseTest {

    @Mock
    private UserService userService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordUseCase passwordUseCase;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encoded-old-password");
    }

    @Test
    @DisplayName("Deve trocar a senha voluntariamente com sucesso")
    void shouldChangePasswordSuccessfully() {
        // Arrange
        ChangePasswordRequestDto request = new ChangePasswordRequestDto("old-pass", "new-pass");
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(testUser);
        when(userService.userIsPresent("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.matches("old-pass", "encoded-old-password")).thenReturn(true);
        when(passwordEncoder.encode("new-pass")).thenReturn("encoded-new-password");

        // Act
        passwordUseCase.changePassword(auth, request);

        // Assert
        assertEquals("encoded-new-password", testUser.getPassword());
        assertFalse(testUser.isPasswordResetRequired());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Deve falhar na troca voluntária se a senha antiga estiver errada")
    void shouldFailWhenOldPasswordIsIncorrect() {
        // Arrange
        ChangePasswordRequestDto request = new ChangePasswordRequestDto("wrong-pass", "new-pass");
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(testUser);
        when(userService.userIsPresent("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.matches("wrong-pass", "encoded-old-password")).thenReturn(false);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> passwordUseCase.changePassword(auth, request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve realizar reset administrativo e marcar flag obrigatória")
    void shouldPerformAdminReset() {
        // Arrange
        ResetPasswordRequestDto request = new ResetPasswordRequestDto("test@example.com");
        when(userService.userIsPresent("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-temp-password");

        // Act
        String tempPass = passwordUseCase.resetByAdmin(request);

        // Assert
        assertNotNull(tempPass);
        assertTrue(testUser.isPasswordResetRequired());
        assertEquals("encoded-temp-password", testUser.getPassword());
        verify(userRepository).save(testUser);
    }
}
