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
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Manipulador global de exceções da API.
 * Centraliza o tratamento de erros e garante que as respostas sigam o padrão {@link DataObjectError}.
 */
@Slf4j
@RestControllerAdvice
public class HttpExceptionHandler {

    /**
     * Trata exceções personalizadas da aplicação que estendem {@link AppException}.
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<DataObjectError> handleAppException(AppException appException) {
        log.warn("Exceção de negócio: {} - {}", appException.getErrorCode(), appException.getMessage());
        return buildErrorResponse(appException.getMessage(), appException.getErrorCode().getHttpStatus());
    }

    /**
     * Trata erros de validação de campos enviados nas requisições (Bean Validation).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<DataObjectError> handleValidationExceptions(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Erro de validação em {} campos: {}", errors.size(), errors);
        DataObjectError error = DataObjectError.builder()
                .message("Erro de validação nos campos informados")
                .code(HttpStatus.BAD_REQUEST.value())
                .timestamp(new Date())
                .details(errors)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Trata falhas de autenticação (Usuário/Senha incorretos).
     */
    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<DataObjectError> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException exception) {
        log.info("Tentativa de login com credenciais inválidas.");
        return buildErrorResponse("Usuário ou senha inválidos", HttpStatus.UNAUTHORIZED);
    }

    /**
     * Trata falhas genéricas de autenticação no nível de Controller.
     */
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<DataObjectError> handleAuthenticationException(org.springframework.security.core.AuthenticationException exception) {
        log.error("Falha de autenticação: {}", exception.getMessage());
        return buildErrorResponse("Acesso não autorizado ou sessão expirada.", HttpStatus.UNAUTHORIZED);
    }

    /**
     * Trata requisições para rotas que não existem (Spring Boot 3.2+).
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<DataObjectError> handleNoResourceFound(NoResourceFoundException exception) {
        log.warn("Recurso não encontrado: {}", exception.getResourcePath());
        return buildErrorResponse("O recurso solicitado não foi encontrado no servidor", HttpStatus.NOT_FOUND);
    }

    /**
     * Trata requisições para rotas que não possuem manipulador.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<DataObjectError> handleNotFound(NoHandlerFoundException exception) {
        log.warn("Rota não encontrada: {}", exception.getRequestURL());
        return buildErrorResponse("O recurso solicitado não foi encontrado", HttpStatus.NOT_FOUND);
    }

    /**
     * Trata erros de parâmetros ausentes na requisição.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<DataObjectError> handleMissingParams(MissingServletRequestParameterException exception) {
        log.warn("Parâmetro obrigatório ausente: {}", exception.getParameterName());
        return buildErrorResponse("O parâmetro '" + exception.getParameterName() + "' é obrigatório", HttpStatus.BAD_REQUEST);
    }

    /**
     * Trata erros de tipo de argumento inválido (ex: string onde se espera long).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<DataObjectError> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        log.warn("Tipo de argumento inválido para o parâmetro {}: {}", exception.getName(), exception.getValue());
        return buildErrorResponse("Valor inválido para o parâmetro '" + exception.getName() + "'", HttpStatus.BAD_REQUEST);
    }

    /**
     * Trata o uso de métodos HTTP incorretos.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<DataObjectError> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        log.warn("Método {} não suportado para a rota.", exception.getMethod());
        return buildErrorResponse("Método HTTP não suportado para esta rota", HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Trata violações de integridade no banco de dados.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<DataObjectError> handleDataIntegrity(DataIntegrityViolationException exception) {
        log.error("Conflito de integridade de dados: {}", exception.getMostSpecificCause().getMessage());
        return buildErrorResponse("Erro de integridade de dados ou duplicidade", HttpStatus.CONFLICT);
    }

    /**
     * Fallback para qualquer exceção não tratada especificamente (Erro 500).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<DataObjectError> handleGenericException(Exception exception) {
        log.error("ERRO NÃO TRATADO: ", exception); // Loga o stacktrace completo no servidor
        return buildErrorResponse("Ocorreu um erro interno no servidor", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<DataObjectError> buildErrorResponse(String message, HttpStatus status) {
        DataObjectError error = DataObjectError.builder()
                .message(message)
                .code(status.value())
                .timestamp(new Date())
                .build();
        return new ResponseEntity<>(error, status);
    }
}
