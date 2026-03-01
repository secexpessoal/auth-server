/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.infra.security.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UuidV7ServiceTest {

    @Test
    @DisplayName("Deve gerar UUIDs v7 válidos e sequenciais")
    void deveGerarUuidV7Valido() {
        UUID uuid1 = UuidV7Service.randomV7();
        UUID uuid2 = UuidV7Service.randomV7();

        assertNotNull(uuid1);
        assertNotNull(uuid2);
        assertNotEquals(uuid1, uuid2);
        
        // Versão deve ser 7 (RFC 9562)
        assertEquals(7, uuid1.version());
        assertEquals(7, uuid2.version());

        // Timestamp deve ser sequencial ou igual (48 bits iniciais)
        long ts1 = uuid1.getMostSignificantBits() >>> 16;
        long ts2 = uuid2.getMostSignificantBits() >>> 16;
        assertTrue(ts2 >= ts1, "Timestamp do segundo UUID deve ser maior ou igual ao primeiro");
    }
}
