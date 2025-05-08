package com.malnutrition.backend.global.security.oauth;

import com.malnutrition.backend.domain.user.user.dto.UserJoinRequestDto;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.security.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOauth2UserService extends DefaultOAuth2UserService {
    private final UserService userService;
    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String oauthId = oAuth2User.getName();
        String providerTypeCode = userRequest
                .getClientRegistration() // ClientRegistration
                .getRegistrationId()     // String
                .toUpperCase(Locale.getDefault());

        Map<String, Object> attributes = oAuth2User.getAttributes();
        Map<String, String> attributesProperties = (Map<String, String>) attributes.get("properties");
        String nickname = attributesProperties.get("nickname");
        String email = ((Map<String, Object>) attributes.get("kakao_account")).get("email").toString();

//        log.info("email {}", email2);
//        log.info("attributes {}", attributes);
//        String email = providerTypeCode + "__" + oauthId;

        UserJoinRequestDto userJoinRequestDto = new UserJoinRequestDto(email, "", nickname, "");
        User user = userService.modifyOrJoin(userJoinRequestDto, providerTypeCode);

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                "",
                user.getNickname(),
                user.getAuthorities()
        );
    }

}
