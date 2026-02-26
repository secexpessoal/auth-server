/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.exception.custom;

import com.auth.infra.exception.ErrorCode;
import com.auth.infra.exception.base.AppException;

public class NotFoundException extends AppException {
    public NotFoundException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
