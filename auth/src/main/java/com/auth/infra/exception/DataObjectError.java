/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.Date;
import java.util.Map;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record DataObjectError(
        String message,
        Date timestamp,
        Integer code,
        Map<String, String> details
) {
}
