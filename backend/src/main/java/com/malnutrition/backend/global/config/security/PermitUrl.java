package com.malnutrition.backend.global.config.security;

public class PermitUrl {

    //모든 메서드 요청 허용
    public static final String[] ALL_URLS = {

    };
    public static final String[] GET_URLS = {
            "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
            "/actuator/**", "/error", "/css/**", "/js/**",
            "/api/v1/images/view/*"
    };

    public static final String[] POST_URLS = {
            "/api/v1/users/join", "/api/v1/users/login"
    };

    public static final String[] PUT_URLS = {
            // PUT 메서드에 해당하는 경로를 여기에 추가
    };

    public static final String[] DELETE_URLS = {
            // DELETE 메서드에 해당하는 경로를 여기에 추가
    };


}
