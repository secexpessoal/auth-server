/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.error.custom;

import com.auth.infra.error.ErrorCode;
import com.auth.infra.error.base.AppException;

public class BadRequestException extends AppException {
    public BadRequestException(ErrorCode errorCode) {
        super(errorCode);
    }
}
