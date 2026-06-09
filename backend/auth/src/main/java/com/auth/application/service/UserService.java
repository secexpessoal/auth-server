/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import com.auth.api.v1.dto.auth.AuthenticationRequestDto;
import com.auth.api.v1.dto.auth.InPersonWorkPeriodDto;
import com.auth.api.v1.dto.auth.RegisterRequestDto;
import com.auth.api.v1.dto.auth.RegisterResponseDtoV1;
import com.auth.api.v1.dto.auth.UpdateUserProfileRequestDto;
import com.auth.api.v1.dto.auth.UpdateUserRolesRequestDto;
import com.auth.api.v1.dto.auth.UserResponseDtoV1;
import com.auth.api.v1.dto.common.PaginatedResponseDto;
import com.auth.api.v1.dto.common.PaginationMetaDto;
import com.auth.api.v1.dto.password.ChangePasswordRequestDto;
import com.auth.api.v1.dto.password.FirstChangePasswordRequestDto;
import com.auth.api.v1.dto.password.ResetPasswordRequestDto;
import com.auth.api.v1.mapper.UserMapper;
import com.auth.api.v2.dto.auth.UserResponseDtoV2;
import com.auth.application.payload.AuthMetadata;
import com.auth.application.payload.AuthenticationResult;
import com.auth.domain.model.Position;
import com.auth.domain.model.RefreshToken;
import com.auth.domain.model.Role;
import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import com.auth.domain.repository.PositionRepository;
import com.auth.domain.repository.UserAuthRepository;
import com.auth.domain.repository.UserDataRepository;
import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.exception.custom.NotFoundException;
import com.auth.infra.security.service.JwtGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserAuthRepository userRepository;
    private final UserDataRepository userDataRepository;
    private final PasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;
    private final PositionRepository positionRepository;
    private final UserMapper userMapper;
    private final PasswordGeneratorService passwordGeneratorService;
    private final EmailService emailService;
    private final AuthenticationManager authManager;
    private final JwtGeneratorService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RedirectService redirectService;

    // --- Original UserService Methods ---

    @Transactional
    public UserAuth userRegister(RegisterRequestDto request, Role role, String tempPassword) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, "Este e-mail já está em uso!");
        }

        UserAuth user = new UserAuth();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.getRoles().add(role);
        user.setPasswordResetRequired(true);

        UserData userData = new UserData();
        userData.setUserName(request.userName());
        userData.setUser(user);
        user.setUserProfile(userData);

        userDataRepository.save(userData);
        return userRepository.save(user);
    }

    public void incrementTokenVersion(UserAuth user) {
        Integer currentVersion = user.getTokenVersion();
        user.setTokenVersion(currentVersion + 1);
        userRepository.save(user);
    }

    public UserAuth userIsPresent(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado!"));
    }

    public AuthenticationResult login(AuthenticationRequestDto loginRequest, AuthMetadata metadata) {
        String validatedRedirect = redirectService.validateRedirectUri(loginRequest.redirectUri());

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        if (!(auth.getPrincipal() instanceof UserAuth user)) {
            log.error("Falha crítica: Principal não é do tipo UserAuth para o usuário {}", loginRequest.email());
            throw new BadRequestException(ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao recuperar dados do usuário autenticado");
        }

        log.info("Usuário {} autenticado com sucesso via IP {}. Roles: {}", user.getEmail(), metadata.ipAddress(), user.getRoles());

        String jwt = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user,
                metadata.userAgent(), metadata.ipAddress(), metadata.origin(), metadata.referer());

        return AuthenticationResult.builder()
                .user(user)
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .tokenVersion(refreshToken.getVersion())
                .passwordResetRequired(user.isPasswordResetRequired())
                .redirectUri(validatedRedirect)
                .build();
    }

    public UserResponseDtoV1 validateToken(Authentication authentication) {
        UserAuth user = (UserAuth) Optional.ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof UserAuth)
                .orElseThrow(() -> new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado ou sessão inválida"));

        return userMapper.toResponse(user);
    }

    public void changePassword(Authentication authentication, ChangePasswordRequestDto request) {
        UserAuth user = getUserFromAuth(authentication);
        user = userIsPresent(user.getEmail());

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, "A senha atual informada está incorreta.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetRequired(false);
        userRepository.save(user);
    }

    public void changeFirstPassword(Authentication authentication, FirstChangePasswordRequestDto request) {
        UserAuth user = getUserFromAuth(authentication);
        user = userIsPresent(user.getEmail());

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetRequired(false);
        userRepository.save(user);
    }

    public String resetByAdmin(ResetPasswordRequestDto request) {
        UserAuth user = userIsPresent(request.email());
        String tempPassword = passwordGeneratorService.generateTemporaryPassword();

        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setPasswordResetRequired(true);
        userRepository.save(user);

        return tempPassword;
    }

    public void resetByUser(ResetPasswordRequestDto request) {
        try {
            UserAuth user = userIsPresent(request.email());
            String tempPassword = passwordGeneratorService.generateTemporaryPassword();

            user.setPassword(passwordEncoder.encode(tempPassword));
            user.setPasswordResetRequired(true);
            userRepository.save(user);

            emailService.sendResetPasswordEmail(user.getEmail(), user.getUsername(), tempPassword);
        } catch (NotFoundException notFoundException) {
            log.warn("Tentativa de reset de senha para e-mail inexistente: {}", request.email());
        }
    }

    private UserAuth getUserFromAuth(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof UserAuth user)) {
            throw new BadRequestException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado");
        }
        return user;
    }

    public PaginatedResponseDto<UserResponseDtoV1> listUsers(int page, int limit, String requestUrl, String email, String userName, String positionName) {
        Page<@NonNull UserAuth> usersPage = listUsersCore(page, limit, email, userName, positionName);
        Map<UUID, String> positionNameCache = positionRepository.findAll().stream().collect(Collectors.toMap(Position::getId, Position::getName));
        List<UserResponseDtoV1> data = usersPage.getContent().stream().map(userItem -> userMapper.toResponse(userItem, positionNameCache)).toList();
        return buildPaginatedResponse(usersPage, data, requestUrl, email, userName, positionName);
    }

    public PaginatedResponseDto<UserResponseDtoV2> listUsersV2(int page, int limit, String requestUrl, String email, String userName, String positionName) {
        Page<@NonNull UserAuth> usersPage = listUsersCore(page, limit, email, userName, positionName);
        List<UserResponseDtoV2> data = usersPage.getContent().stream().map(userMapper::toResponseV2).toList();
        return buildPaginatedResponseV2(usersPage, data, requestUrl, email, userName, positionName);
    }

    private Page<@NonNull UserAuth> listUsersCore(int page, int limit, String email, String userName, String positionName) {
        Pageable pageable = PageRequest.of(page, limit);
        List<UUID> matchingUserIds = null;

        if (isProfileFilterPresent(userName, positionName)) {
            matchingUserIds = findUserIdsByProfileFilters(userName, positionName);
            if (matchingUserIds.isEmpty()) {
                return Page.empty(pageable);
            }
        }

        Query query = new Query();
        if (email != null && !email.isBlank()) {
            query.addCriteria(Criteria.where("email").regex(Pattern.quote(email), "i"));
        }

        if (matchingUserIds != null) {
            query.addCriteria(Criteria.where("_id").in(matchingUserIds));
        }

        long totalCount = mongoTemplate.count(Query.of(query), UserAuth.class);
        query.with(pageable);

        List<UserAuth> users = mongoTemplate.find(query, UserAuth.class);
        return new PageImpl<>(users, pageable, totalCount);
    }

    private boolean isProfileFilterPresent(String userName, String positionName) {
        return (userName != null && !userName.isBlank()) || (positionName != null && !positionName.isBlank());
    }

    private List<UUID> findUserIdsByProfileFilters(String userName, String positionName) {
        Query dataQuery = new Query();

        if (userName != null && !userName.isBlank()) {
            dataQuery.addCriteria(Criteria.where("name").regex(Pattern.quote(userName), "i"));
        }

        if (positionName != null && !positionName.isBlank()) {
            List<UUID> matchingPositionIds = positionRepository.findAll()
                    .stream()
                    .filter(positionItem -> positionItem.getName().toLowerCase().contains(positionName.toLowerCase()))
                    .map(Position::getId)
                    .toList();

            if (matchingPositionIds.isEmpty()) {
                return List.of();
            }

            dataQuery.addCriteria(Criteria.where("current_position.position_id").in(matchingPositionIds));
        }

        return mongoTemplate.find(dataQuery, UserData.class).stream().map(UserData::getUserId).toList();
    }

    private PaginatedResponseDto<UserResponseDtoV1> buildPaginatedResponse(Page<@NonNull UserAuth> page, List<UserResponseDtoV1> data, String url, String email, String name, String pos) {
        PaginationMetaDto meta = PaginationMetaDto.builder()
                .page(page.getNumber())
                .limit(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        String queryParams = buildQueryParams(email, name, pos);

        String nextLink = page.hasNext()
                ? String.format("%s?page=%d&limit=%d%s", url, page.getNumber() + 1, page.getSize(), queryParams)
                : "";

        String prevLink = page.hasPrevious()
                ? String.format("%s?page=%d&limit=%d%s", url, page.getNumber() - 1, page.getSize(), queryParams)
                : "";

        return PaginatedResponseDto.<UserResponseDtoV1>builder()
                .data(data)
                .meta(Map.of("pagination", meta))
                .links(Map.of("next", nextLink, "prev", prevLink))
                .build();
    }

    private String buildQueryParams(String email, String name, String pos) {
        StringBuilder params = new StringBuilder();
        if (email != null && !email.isBlank()) params.append("&email=").append(email);
        if (name != null && !name.isBlank()) params.append("&userName=").append(name);
        if (pos != null && !pos.isBlank()) params.append("&position=").append(pos);

        return params.toString();
    }

    private PaginatedResponseDto<UserResponseDtoV2> buildPaginatedResponseV2(Page<@NonNull UserAuth> page, List<UserResponseDtoV2> data, String url, String email, String name, String pos) {
        PaginationMetaDto meta = PaginationMetaDto.builder()
                .page(page.getNumber())
                .limit(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        String queryParams = buildQueryParams(email, name, pos);

        String nextLink = page.hasNext()
                ? String.format("%s?page=%d&limit=%d%s", url, page.getNumber() + 1, page.getSize(), queryParams)
                : "";

        String prevLink = page.hasPrevious()
                ? String.format("%s?page=%d&limit=%d%s", url, page.getNumber() - 1, page.getSize(), queryParams)
                : "";

        return PaginatedResponseDto.<UserResponseDtoV2>builder()
                .data(data)
                .meta(Map.of("pagination", meta))
                .links(Map.of("next", nextLink, "prev", prevLink))
                .build();
    }

    private PaginatedResponseDto<UserResponseDtoV2> buildEmptyResponseV2(int page, int limit) {
        PaginationMetaDto meta = PaginationMetaDto.builder()
                .page(page)
                .limit(limit)
                .totalItems(0L)
                .totalPages(0)
                .hasNext(false)
                .hasPrevious(false)
                .build();

        return PaginatedResponseDto.<UserResponseDtoV2>builder()
                .data(List.of())
                .meta(Map.of("pagination", meta))
                .links(Map.of("next", "", "prev", ""))
                .build();
    }

    public RegisterResponseDtoV1 register(RegisterRequestDto request, Role role) {
        String tempPassword = passwordGeneratorService.generateTemporaryPassword();

        UserAuth user = Optional.ofNullable(userRegister(request, role, tempPassword))
                .orElseThrow(() -> new BadRequestException(ErrorCode.INTERNAL_SERVER_ERROR, "Erro ao registrar usuário"));

        return RegisterResponseDtoV1.builder()
                .email(user.getEmail())
                .tempPassword(tempPassword)
                .build();
    }

    @Transactional
    public UserResponseDtoV1 updateProfile(UUID userId, UpdateUserProfileRequestDto request) {
        UserAuth user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado"));

        InPersonWorkPeriodDto period = request.inPersonWorkPeriod();
        UserData profile = resolveOrCreateProfile(user);

        try {
            profile.updateBasicInfo(
                    request.username(),
                    request.registration(),
                    request.birthDate(),
                    request.workRegime(),
                    request.livesElsewhere()
            );

            profile.updateInPersonWorkPeriod(
                    period != null
                            ? period.frequencyCycleWeeks()
                            : null,
                    period != null
                            ? period.frequencyWeekMask()
                            : null,
                    period != null
                            ? period.frequencyDurationDays()
                            : null
            );

            if (request.position() != null && !request.position().isBlank()) {
                Position selectedPosition = positionRepository.findAll().stream()
                        .filter(positionItem -> positionItem.getName().equalsIgnoreCase(request.position()))
                        .findFirst()
                        .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Cargo informado não foi encontrado"));

                profile.assignPosition(selectedPosition.getId(), false, null);
            }

            profile.touch();
            profile.setUser(user);
            user.setUserProfile(profile);

            userDataRepository.save(profile);
            userRepository.save(user);

        } catch (IllegalArgumentException | IllegalStateException exception) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, exception.getMessage());
        }

        return userMapper.toResponse(user);
    }

    private UserData resolveOrCreateProfile(UserAuth user) {
        return userDataRepository.findFirstByUserOrderByUpdatedAtDesc(user)
                .orElseGet(() -> {
                    UserData newProfile = new UserData();
                    newProfile.setUser(user);
                    user.setUserProfile(newProfile);
                    return newProfile;
                });
    }

    public UserResponseDtoV1 updateRoles(UUID userId, UpdateUserRolesRequestDto request) {
        UserAuth user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado"));

        try {
            user.updateRoles(request.roles());
            userRepository.save(user);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(ErrorCode.BAD_REQUEST, exception.getMessage());
        }

        return userMapper.toResponse(user);
    }

    public void updateStatus(UUID userId, boolean active) {
        UserAuth user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND, "Usuário não encontrado com o ID: " + userId));

        user.setActive(active);
        userRepository.save(user);
    }
}
