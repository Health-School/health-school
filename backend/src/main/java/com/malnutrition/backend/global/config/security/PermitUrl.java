package com.malnutrition.backend.global.config.security;

public class PermitUrl {

    //모든 메서드 요청 허용
    public static final String[] ALL_URLS = {
            "/api/v1/lectures/**", "/api/v1/orders/**",
            "/api/v1/lectureUsers/**","/api/v1/notifications/**",
            "/api/v1/exerciseSheets/**","/api/v1/admin/machine-types/**",
            "/api/v1/admin/machines/**","/api/v1/chatrooms/**",
            "/api/chat/**", "/ws-stomp/**", "/ws/**", "/chat/**",
            "/api/v1/users/**","/api/v1/chats/**","/api/v1/machine-exercises/**",
            "/api/v1/reports/**"

    };
    public static final String[] GET_URLS = {
            "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
            "/actuator/**", "/error", "/css/**", "/js/**",
            "/api/v1/images/view/*", "/api/v1/email/join/send",
            "/api/v1/lectures/**", "/api/v1/lecture_categories/**",
            "/api/v1/lectureUsers/**", "/api/v1/curriculums/**",
            "/api/v1/curriculum-progress/**",
            "/api/v1/lecture_categories",
    };

    public static final String[] POST_URLS = {
            "/api/v1/users/join", "/api/v1/users/login",
            "/api/v1/email/password/send", "/api/v1/email/verify",
            "/api/v1/email/join/send","/api/v1/sms/join/send-code", "/api/v1/sms/join/verify-code",
            "/api/v1/sms/find-email/verify-code", "/api/v1/sms/find-email/send-code",
            "/api/v1/lectures", "/api/v1/lecture_categories", "/api/v1/lectureUsers",
            "/api/v1/curriculums", "/api/v1/curriculum-progress",
            "/api/v1/reports/*"
    };

    public static final String[] PUT_URLS = {
            // PUT 메서드에 해당하는 경로를 여기에 추가
            "/api/v1/reports/*"
    };

    public static final String[] DELETE_URLS = {
            // DELETE 메서드에 해당하는 경로를 여기에 추가
            "/api/v1/reports/*"
    };


}
