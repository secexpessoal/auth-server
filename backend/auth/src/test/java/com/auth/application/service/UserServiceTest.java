/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.api.v1.dto.auth.AuthenticationRequestDto;
import com.auth.api.v1.dto.auth.RegisterRequestDto;
import com.auth.api.v1.dto.auth.UpdateUserProfileRequestDto;
import com.auth.api.v1.dto.auth.UpdateUserRolesRequestDto;
import com.auth.api.v1.dto.auth.UserResponseDtoV1;
import com.auth.api.v1.dto.common.PaginatedResponseDto;
import com.auth.api.v1.dto.password.ChangePasswordRequestDto;
import com.auth.api.v1.dto.password.ResetPasswordRequestDto;
import com.auth.application.payload.AuthMetadata;
import com.auth.application.payload.AuthenticationResult;
import com.auth.api.v1.mapper.UserMapper;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.PositionRepository;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.domain.repository.UserDataRepository;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import com.auth.infra.security.service.JwtGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserAuthRepository userRepository;
    @Mock
    private UserDataRepository userDataRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private MongoTemplate mongoTemplate;
    @Mock
    private PositionRepository positionRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordGeneratorService passwordGeneratorService;
    @Mock
    private EmailService emailService;
    @Mock
    private AuthenticationManager authManager;
    @Mock
    private JwtGeneratorService jwtService;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private RedirectService redirectService;

    @InjectMocks
    private UserService userService;

    private UserAuth testUser;

    @BeforeEach
    void setUp() {
        testUser = new UserAuth();
        testUser.setUserId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashed");
        testUser.setRoles(new java.util.HashSet<>(Set.of(Role.USER)));
        testUser.setActive(true);

        UserData userData = new UserData();
        userData.setUserName("testuser");
        userData.setUser(testUser);
        testUser.setUserProfile(userData);
    }

    @Nested
    @DisplayName("Testes de Registro")
    class RegisterTests {
        @Test
        @DisplayName("Deve registrar usuário com sucesso")
        void shouldRegisterUser() {
            RegisterRequestDto request = new RegisterRequestDto("john", "john@example.com", Role.USER);
            when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
            when(passwordEncoder.encode("pass123")).thenReturn("hashed");
            when(userRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
            when(userDataRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

            UserAuth saved = userService.userRegister(request, Role.USER, "pass123");

            assertNotNull(saved);
            assertEquals("john@example.com", saved.getEmail());
            assertEquals("hashed", saved.getPassword());
            verify(userRepository, times(2)).save(any());
        }

        @Test
        @DisplayName("Deve lançar exceção se usuário já existir")
        void shouldThrowIfUserExists() {
            RegisterRequestDto request = new RegisterRequestDto("john", "john@example.com", Role.USER);
            when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(new UserAuth()));

            assertThrows(BadRequestException.class, () -> userService.userRegister(request, Role.USER, "pass123"));
        }
    }

    @Nested
    @DisplayName("Testes de Login")
    class LoginTests {
        @Test
        @DisplayName("Deve realizar login com sucesso")
        void shouldLoginSuccessfully() {
            AuthenticationRequestDto request = new AuthenticationRequestDto("test@example.com", "password", null);
            when(redirectService.validateRedirectUri(any())).thenReturn(null);

            Authentication auth = mock(Authentication.class);
            when(auth.getPrincipal()).thenReturn(testUser);
            when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
            
            when(jwtService.generateToken(testUser)).thenReturn("fake-jwt");
            
            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setToken("fake-refresh");
            refreshToken.setVersion(1);
            when(refreshTokenService.createRefreshToken(any(), any(), any(), any(), any())).thenReturn(refreshToken);
            
            AuthenticationResult result = userService.login(request, new AuthMetadata("Mozilla", "127.0.0.1", "origin", "referer"));

            assertNotNull(result);
            assertEquals("fake-jwt", result.accessToken());
            assertEquals("fake-refresh", result.refreshToken());
        }

        @Test
        @DisplayName("Deve lançar BadCredentialsException quando a senha for inválida")
        void shouldThrowExceptionWhenCredentialsAreInvalid() {
            AuthenticationRequestDto request = new AuthenticationRequestDto("test@example.com", "wrong", null);
            when(redirectService.validateRedirectUri(any())).thenReturn(null);
            when(authManager.authenticate(any())).thenThrow(new BadCredentialsException("Invalid"));

            assertThrows(BadCredentialsException.class, () -> userService.login(request, new AuthMetadata("Mozilla", "127.0.0.1", "origin", "referer")));
        }
    }

    @Nested
    @DisplayName("Testes de Senha")
    class PasswordTests {
        @Test
        @DisplayName("Deve trocar senha com sucesso")
        void shouldChangePassword() {
            ChangePasswordRequestDto request = new ChangePasswordRequestDto("old", "new");
            Authentication auth = mock(Authentication.class);
            when(auth.getPrincipal()).thenReturn(testUser);
            when(userRepository.findByEmail(any())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("old", "hashed")).thenReturn(true);
            when(passwordEncoder.encode("new")).thenReturn("new-hashed");

            userService.changePassword(auth, request);

            assertEquals("new-hashed", testUser.getPassword());
            assertFalse(testUser.isPasswordResetRequired());
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("Deve resetar senha por admin")
        void shouldResetByAdmin() {
            ResetPasswordRequestDto request = new ResetPasswordRequestDto("test@example.com");
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(passwordGeneratorService.generateTemporaryPassword()).thenReturn("temp123");
            when(passwordEncoder.encode("temp123")).thenReturn("temp-hashed");

            String temp = userService.resetByAdmin(request);

            assertEquals("temp123", temp);
            assertTrue(testUser.isPasswordResetRequired());
            assertEquals("temp-hashed", testUser.getPassword());
            verify(userRepository).save(testUser);
        }
    }

    @Nested
    @DisplayName("Testes de Gestão de Usuário")
    class UserManagementTests {
        @Test
        @DisplayName("Deve atualizar status do usuário")
        void shouldUpdateStatus() {
            UUID id = testUser.getUserId();
            when(userRepository.findById(id)).thenReturn(Optional.of(testUser));

            userService.updateStatus(id, false);

            assertFalse(testUser.getActive());
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("Deve atualizar papéis do usuário")
        void shouldUpdateRoles() {
            UUID id = testUser.getUserId();
            UpdateUserRolesRequestDto request = new UpdateUserRolesRequestDto(Set.of(Role.ADMIN));
            when(userRepository.findById(id)).thenReturn(Optional.of(testUser));

            userService.updateRoles(id, request);

            assertTrue(testUser.getRoles().contains(Role.ADMIN));
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("Deve listar usuários com sucesso")
        void shouldListUsers() {
            when(mongoTemplate.count(any(), eq(UserAuth.class))).thenReturn(1L);
            when(mongoTemplate.find(any(), eq(UserAuth.class))).thenReturn(List.of(testUser));
            when(positionRepository.findAll()).thenReturn(List.of());
            when(userMapper.toResponse(any(), anyMap())).thenReturn(UserResponseDtoV1.builder().build());

            PaginatedResponseDto<UserResponseDtoV1> result = userService.listUsers(0, 10, "url", null, null, null);

            assertNotNull(result);
            assertEquals(1, result.data().size());
        }

        @Test
        @DisplayName("Deve atualizar perfil do usuário")
        void shouldUpdateProfile() {
            UUID id = testUser.getUserId();
            UpdateUserProfileRequestDto request = UpdateUserProfileRequestDto.builder()
                    .username("newname")
                    .build();
            when(userRepository.findById(id)).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(any())).thenReturn(UserResponseDtoV1.builder().build());

            userService.updateProfile(id, request);

            assertEquals("newname", testUser.getUserProfile().getUserName());
            verify(userDataRepository).save(any());
        }

        @Test
        @DisplayName("Deve criar perfil ao atualizar usuário sem UserProfile vinculado")
        void shouldCreateProfileWhenMissingDuringUpdate() {
            UUID id = testUser.getUserId();
            testUser.setUserProfile(null);
            UpdateUserProfileRequestDto request = UpdateUserProfileRequestDto.builder()
                    .username("Sap")
                    .registration("000000")
                    .build();
            when(userRepository.findById(id)).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(any())).thenReturn(UserResponseDtoV1.builder().build());

            userService.updateProfile(id, request);

            assertNotNull(testUser.getUserProfile());
            assertEquals("Sap", testUser.getUserProfile().getUserName());
            assertEquals("000000", testUser.getUserProfile().getRegistration());
            verify(userDataRepository).save(testUser.getUserProfile());
            verify(userRepository).save(testUser);
        }
    }

    @Test
    @DisplayName("Deve lançar NotFoundException se usuário não existir")
    void shouldThrowIfUserNotFound() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> userService.userIsPresent("ghost@example.com"));
    }
}
