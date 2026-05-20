package com.auth.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class CircularToStringTest {

    @Test
    @DisplayName("Deve evitar StackOverflow ao chamar toString em relacionamentos circulares")
    void shouldNotThrowStackOverflowOnToString() {
        UserAuth userAuth = new UserAuth();
        UserData userData = new UserData();

        userAuth.setEmail("test@test.com");
        userAuth.setUserData(userData);
        
        userData.setUserName("Test User");
        userData.setUser(userAuth);

        assertDoesNotThrow(() -> {
            String authStr = userAuth.toString();
            String dataStr = userData.toString();
            System.out.println("UserAuth.toString(): " + authStr);
            System.out.println("UserData.toString(): " + dataStr);
        });
    }

    @Test
    @DisplayName("Deve evitar StackOverflow ao chamar hashCode em relacionamentos circulares")
    void shouldNotThrowStackOverflowOnHashCode() {
        UserAuth userAuth = new UserAuth();
        UserData userData = new UserData();

        userAuth.setEmail("test@test.com");
        userAuth.setUserData(userData);
        
        userData.setUserName("Test User");
        userData.setUser(userAuth);

        assertDoesNotThrow(() -> {
            int authHash = userAuth.hashCode();
            int dataHash = userData.hashCode();
        });
    }
}
