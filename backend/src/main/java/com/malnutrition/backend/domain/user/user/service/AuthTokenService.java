package com.malnutrition.backend.domain.user.user.service;


import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jwt.JwtUt;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class AuthTokenService {
    @Value("${custom.jwt.secretKey}")
    private String jwtSecretKey;

    @Value("${custom.accessToken.expirationSeconds}")
    private long accessTokenExpirationSeconds;

    String genAccessToken(User user) {
        long id = user.getId();
        String email = user.getEmail();

        String nickname = user.getNickname();
        return JwtUt.jwt.toString(
                jwtSecretKey,
                accessTokenExpirationSeconds,
                Map.of("id", id, "email", email, "nickname", nickname)
        );
    }

    Map<String, Object> payload(String accessToken) {
        Map<String, Object> parsedPayload = JwtUt.jwt.payload(jwtSecretKey, accessToken);

        if (parsedPayload == null) return null;

        long id = (long) (Integer) parsedPayload.get("id");
        String email = (String) parsedPayload.get("email");
        String nickname = (String) parsedPayload.get("nickname");
        return Map.of("id", id, "email", email, "nickname", nickname);
    }
}
