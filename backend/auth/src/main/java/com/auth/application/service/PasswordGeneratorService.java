/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.application.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Serviço responsável pela geração de senhas seguras e aleatórias.
 */
@Service
public class PasswordGeneratorService {

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String SPECIAL = "!@#$%&*()_+-=[]?";
    private static final String NUMBER = "0123456789";

    private static final String ALL_CHARS = CHAR_LOWER + CHAR_UPPER + NUMBER + SPECIAL;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Gera uma senha temporária aleatória com o comprimento especificado.
     * Garante ao menos um caractere de cada tipo (maiúscula, minúscula, número e especial).
     *
     * @param length Comprimento da senha (máximo recomendado: 15).
     * @return Senha aleatória gerada.
     */
    public String generate(int length) {
        if (length < 4) {
            throw new IllegalArgumentException(
                    "O comprimento da senha deve ser de no mínimo 4 caracteres para garantir complexidade.");
        }

        StringBuilder password = new StringBuilder();

        // Garante um de cada tipo
        password.append(CHAR_LOWER.charAt(RANDOM.nextInt(CHAR_LOWER.length())));
        password.append(CHAR_UPPER.charAt(RANDOM.nextInt(CHAR_UPPER.length())));
        password.append(NUMBER.charAt(RANDOM.nextInt(NUMBER.length())));
        password.append(SPECIAL.charAt(RANDOM.nextInt(SPECIAL.length())));

        // Preenche o restante
        for (int it = 4; it < length; it++) {
            password.append(ALL_CHARS.charAt(RANDOM.nextInt(ALL_CHARS.length())));
        }

        List<Character> characters = password.chars().mapToObj(charValue -> (char) charValue).collect(Collectors.toList());
        Collections.shuffle(characters, RANDOM);

        return characters.stream().map(String::valueOf).collect(Collectors.joining());
    }

    /**
     * Gera uma senha temporária padrão de 12 caracteres.
     *
     * @return Senha de 12 caracteres.
     */
    public String generateTemporaryPassword() {
        return generate(12);
    }
}
