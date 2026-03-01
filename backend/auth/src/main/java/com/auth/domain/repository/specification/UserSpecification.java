/*
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Copyright (c) 2025 Vinícius Gabriel Pereira Leitão
 * Licensed under the BSD 3-Clause License.
 * See LICENSE file in the project root for full license information.
 */
package com.auth.domain.repository.specification;

import com.auth.domain.model.UserAuth;
import com.auth.domain.model.UserData;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<UserAuth> filterBy(String email, String userName, String position) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (email != null && !email.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + email.trim().toLowerCase() + "%"));
            }

            if (userName != null && !userName.isBlank()) {
                Join<UserAuth, UserData> userDataJoin = root.join("userData");
                predicates.add(cb.like(cb.lower(userDataJoin.get("userName")), "%" + userName.trim().toLowerCase() + "%"));
            }

            if (position != null && !position.isBlank()) {
                Join<UserAuth, UserData> userDataJoin = root.join("userData");
                predicates.add(cb.like(cb.lower(userDataJoin.get("position")), "%" + position.trim().toLowerCase() + "%"));
            }

            if (predicates.isEmpty()) {
                return cb.conjunction();
            }

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
}
