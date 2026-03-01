/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.exception.handler;

import com.auth.infra.exception.DataObjectError;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Date;

/**
 * Controller personalizado para lidar com erros mapeados para /error.
 * Garante que rotas de API (/v1/**) sempre retornem JSON, mesmo para erros de infraestrutura.
 */
@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<DataObjectError> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object uri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            httpStatus = HttpStatus.resolve(statusCode);
            if (httpStatus == null) httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String logMessage = message != null ? message.toString() : "Erro inesperado";
        String displayMessage = "Ocorreu um erro ao processar sua solicitação";

        if (httpStatus == HttpStatus.NOT_FOUND) {
            displayMessage = "O recurso solicitado não foi encontrado";
        } else if (httpStatus == HttpStatus.BAD_REQUEST) {
            displayMessage = "A requisição enviada é inválida ou malformada";
        }

        DataObjectError error = DataObjectError.builder()
                .message(displayMessage)
                .code(httpStatus.value())
                .timestamp(new Date())
                .build();

        return new ResponseEntity<>(error, httpStatus);
    }
}
