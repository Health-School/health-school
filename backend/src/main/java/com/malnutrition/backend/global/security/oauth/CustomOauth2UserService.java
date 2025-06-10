package com.malnutrition.backend.global.security.oauth;

import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.security.dto.OauthJoinInfoDto;
import com.malnutrition.backend.global.security.exception.OAuth2AuthenticationProcessingException;
import com.malnutrition.backend.global.security.security.SecurityUser;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

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
//        String nickname = attributesProperties.get("nickname");
        String email = ((Map<String, Object>) attributes.get("kakao_account")).get("email").toString();

//        log.info("email {}", email2);
//        log.info("attributes {}", attributes);
//        String email = providerTypeCode + "__" + oauthId;

        Optional<User> opUser = userService.findByEmail(email);

        // 신규 사용자라면 phoneNumber 입력 필요 -> 임시 세션 저장 후 리다이렉트
        if (opUser.isEmpty()) {
            // 세션에 OAuth2 유저 정보 저장 (추가 입력 화면에서 활용)
            HttpSession session = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest().getSession();
            OauthJoinInfoDto oauthJoinInfoDto = OauthJoinInfoDto.builder()
                    .email(email)
                    .provider(providerTypeCode)
                    .build();

            session.setAttribute("oauthJoinInfo", oauthJoinInfoDto);
            log.info("oauth2 핸드폰 번호 받기");
            throw new OAuth2AuthenticationProcessingException("OAuth2 로그인: 추가 정보 입력 필요");
        }
        User user = opUser.get();

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                "",
                user.getNickname(),
                user.getAuthorities()
        );
    }

}
