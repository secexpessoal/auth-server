/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.exception.handler;

import com.auth.infra.exception.DataObjectError;
import com.auth.infra.exception.base.AppException;
import com.auth.infra.util.RequestUtil;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.slf4j.MDC;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.io.FileNotFoundException;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import static com.auth.infra.config.MdcConfig.REQUEST_ID_KEY;

/**
 * Manipulador global de exceções da API.
 * Centraliza o tratamento de erros e garante que as respostas sigam o padrão {@link DataObjectError}.
 */
@Slf4j
@RestControllerAdvice
public class HttpExceptionHandler {

    /**
     * Trata erros de arquivo não encontrado (ex: quando o fallback da SPA tenta carregar index.html mas ele não existe).
     */
    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<@NonNull DataObjectError> handleFileNotFound(FileNotFoundException exception) {
        log.warn("Arquivo não encontrado: {}", exception.getMessage());
        return buildErrorResponse("O recurso estático solicitado não foi encontrado no servidor", HttpStatus.NOT_FOUND);
    }

    /**
     * Trata exceções personalizadas da aplicação que estendem {@link AppException}.
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<@NonNull DataObjectError> handleAppException(AppException appException) {
        log.warn("Exceção de negócio: {} - {}", appException.getErrorCode(), appException.getMessage());
        return buildErrorResponse(
                appException.getMessage(),
                appException.getErrorCode().getHttpStatus(),
                appException.getErrorCode().name(),
                null);
    }

    /**
     * Trata erros de validação de campos enviados nas requisições (Bean Validation).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<@NonNull DataObjectError> handleValidationExceptions(MethodArgumentNotValidException exception) {
        Map<String, String> errors = extractFieldErrors(exception);

        log.warn("Erro de validação em {} campos: {}", errors.size(), errors);

        return buildValidationErrorResponse(errors);
    }

    /**
     * Trata violações de validação em parâmetros de rota, query e headers.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<@NonNull DataObjectError> handleConstraintViolationException(ConstraintViolationException exception) {
        Map<String, String> errors = new LinkedHashMap<>();

        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            String path = violation.getPropertyPath().toString();
            String fieldName = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
            errors.putIfAbsent(fieldName, violation.getMessage());
        }

        log.warn("Erro de validação em {} campos: {}", errors.size(), errors);

        return buildValidationErrorResponse(errors);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<@NonNull DataObjectError> handleBadCredentials(BadCredentialsException exception) {
        HttpServletRequest request = RequestUtil.getCurrentRequest().orElse(null);
        String attemptedEmail = request != null && request.getAttribute("attempted_email") != null
                ? (String) request.getAttribute("attempted_email")
                : "unknown";
        log.warn("Tentativa de login com credenciais inválidas para o usuário {} via IP {} na rota {}.",
                attemptedEmail, RequestUtil.getClientIP(request), request != null ? request.getRequestURI() : "unknown");
        return buildErrorResponse("Usuário ou senha inválidos", HttpStatus.UNAUTHORIZED);
    }

    /**
     * Trata erro de usuário não encontrado.
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<@NonNull DataObjectError> handleUsernameNotFound(UsernameNotFoundException exception) {
        HttpServletRequest request = RequestUtil.getCurrentRequest().orElse(null);
        log.warn("Usuário não encontrado: {} (IP: {}, rota: {})",
                exception.getMessage(), RequestUtil.getClientIP(request), request != null ? request.getRequestURI() : "unknown");
        return buildErrorResponse(exception.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    /**
     * Trata falhas genéricas de autenticação no nível de Controller.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<@NonNull DataObjectError> handleAuthenticationException(AuthenticationException exception) {
        HttpServletRequest request = RequestUtil.getCurrentRequest().orElse(null);
        log.warn("Falha de autenticação via IP {} na rota {}: {}",
                RequestUtil.getClientIP(request), request != null ? request.getRequestURI() : "unknown", exception.getMessage());
        return buildErrorResponse("Acesso não autorizado ou sessão expirada.", HttpStatus.UNAUTHORIZED);
    }

    /**
     * Trata requisições para rotas que não existem (Spring Boot 3.2+).
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<@NonNull DataObjectError> handleNoResourceFound(NoResourceFoundException exception) {
        log.warn("Recurso não encontrado: {}", exception.getResourcePath());
        return buildErrorResponse("O recurso solicitado não foi encontrado no servidor", HttpStatus.NOT_FOUND);
    }

    /**
     * Trata requisições para rotas que não possuem manipulador.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<@NonNull DataObjectError> handleNotFound(NoHandlerFoundException exception) {
        log.warn("Rota não encontrada: {}", exception.getRequestURL());
        return buildErrorResponse("O recurso solicitado não foi encontrado", HttpStatus.NOT_FOUND);
    }

    /**
     * Trata cookie obrigatório ausente (ex: refresh_token não enviado como HttpOnly).
     */
    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<@NonNull DataObjectError> handleMissingCookie(MissingRequestCookieException exception) {
        HttpServletRequest request = RequestUtil.getCurrentRequest().orElse(null);
        String clientIp = RequestUtil.getClientIP(request);
        String requestUri = request != null ? request.getRequestURI() : "unknown";
        
        if ("refresh_token".equals(exception.getCookieName())) {
            log.info("Cookie obrigatório ausente: refresh_token via IP {} na rota {}.", clientIp, requestUri);
        } else {
            log.warn("Cookie obrigatório ausente: {} via IP {} na rota {}.", exception.getCookieName(), clientIp, requestUri);
        }
        return buildErrorResponse("Sessão inválida ou cookie de autenticação ausente. Por favor, faça login novamente.", HttpStatus.BAD_REQUEST);
    }

    /**
     * Trata erros de parâmetros ausentes na requisição.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<@NonNull DataObjectError> handleMissingParams(MissingServletRequestParameterException exception) {
        log.warn("Parâmetro obrigatório ausente: {}", exception.getParameterName());
        return buildErrorResponse("O parâmetro '" + exception.getParameterName() + "' é obrigatório", HttpStatus.BAD_REQUEST);
    }

    /**
     * Trata erros de tipo de argumento inválido (ex: string onde se espera long).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<@NonNull DataObjectError> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        log.warn("Tipo de argumento inválido para o parâmetro {}: {}", exception.getName(), exception.getValue());
        return buildErrorResponse("Valor inválido para o parâmetro '" + exception.getName() + "'", HttpStatus.BAD_REQUEST);
    }

    /**
     * Trata o uso de métodos HTTP incorretos.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<@NonNull DataObjectError> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        log.warn("Método {} não suportado para a rota.", exception.getMethod());
        return buildErrorResponse("Método HTTP não suportado para esta rota", HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Trata violações de integridade no banco de dados.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<@NonNull DataObjectError> handleDataIntegrity(DataIntegrityViolationException exception) {
        log.error("Conflito de integridade de dados: {}", exception.getMostSpecificCause().getMessage());
        return buildErrorResponse("Erro de integridade de dados ou duplicidade", HttpStatus.CONFLICT);
    }

    /**
     * Fallback para qualquer erro ou exceção não tratada especificamente (Erro 500).
     * Captura Throwable para incluir Errors (como StackOverflowError) além de Exceptions.
     */
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<@NonNull DataObjectError> handleGenericError(Throwable throwable) {
        log.error("ERRO NÃO TRATADO: ", throwable); // Loga o stacktrace completo no servidor
        return buildErrorResponse("Ocorreu um erro interno no servidor", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<@NonNull DataObjectError> buildErrorResponse(String message, HttpStatus status) {
        return buildErrorResponse(message, status, null);
    }

    private ResponseEntity<@NonNull DataObjectError> buildValidationErrorResponse(Map<String, String> details) {
        return buildErrorResponse("Erro de validação nos campos informados", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", details);
    }

    private ResponseEntity<@NonNull DataObjectError> buildErrorResponse(String message, HttpStatus status, Map<String, String> details) {
        return buildErrorResponse(message, status, status.name(), details);
    }

    private ResponseEntity<@NonNull DataObjectError> buildErrorResponse(String message, HttpStatus status, String code, Map<String, String> details) {
        HttpServletRequest request = null;
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) request = attributes.getRequest();
        } catch (Exception ignored) {
        }

        String path = request != null
                ? request.getRequestURI()
                : "Unknown path";
        String traceId = MDC.get(REQUEST_ID_KEY);

        DataObjectError error = DataObjectError.builder()
                .timestamp(new Date())
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(code)
                .message(message)
                .details(details != null && !details.isEmpty() ? details : null)
                .path(path)
                .traceId(traceId)
                .build();
        return new ResponseEntity<>(error, status);
    }

    private Map<String, String> extractFieldErrors(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();

        exception.getBindingResult().getFieldErrors().forEach((FieldError error) -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            if (fieldName != null && errorMessage != null) {
                errors.putIfAbsent(fieldName, errorMessage);
            }
        });

        exception.getBindingResult().getGlobalErrors().forEach((error) -> {
            String objectName = error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            if (objectName != null && errorMessage != null) {
                errors.putIfAbsent(objectName, errorMessage);
            }
        });

        return errors;
    }
}
