/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.http.dto;

import com.auth.infra.config.ServerSecurityConfig;
import lombok.Builder;

@Builder
public record RegisterRequestDto(String userName, String password, ServerSecurityConfig.Role roles) {
}
