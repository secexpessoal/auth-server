/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.model;

import lombok.Getter;

@Getter
public enum WorkRegime {
    HOME_WORK("Teletrabalho"),
    OFFICE("Escritório"),
    HYBRID("Hibrido");

    private final String description;

    WorkRegime(String description) {
        this.description = description;
    }
}
