package com.malnutrition.backend.global.ut;

public class AuthUtil {
    public static String generateRandomCode() {
        return String.valueOf((int)(Math.random() * 899999) + 100000); // 6자리 숫자
    }
}
