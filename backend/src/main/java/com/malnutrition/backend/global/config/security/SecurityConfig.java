package com.malnutrition.backend.global.config.security;

import com.malnutrition.backend.global.security.oauth.CustomOauth2AuthenticationSuccessHandler;
import com.malnutrition.backend.global.security.security.CustomAuthenticationFilter;
import com.malnutrition.backend.global.security.security.CustomAuthorizationRequestResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true) // @PreAuthorize, @PostAuthorize 활성화
public class SecurityConfig {
    private final CustomAuthenticationFilter customAuthenticationFilter;
    private final CustomOauth2AuthenticationSuccessHandler customOauth2AuthenticationSuccessHandler;
    private final CustomAuthorizationRequestResolver customAuthorizationRequestResolver;
    //통과 시킬꺼 넣어야함

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .addFilterBefore(customAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests( auth -> auth
                        // GET 요청 허용
                        .requestMatchers(HttpMethod.GET, PermitUrl.GET_URLS).permitAll()
                        // POST 요청 허용
                        .requestMatchers(HttpMethod.POST, PermitUrl.POST_URLS).permitAll()
                        // PUT 요청 허용
                        .requestMatchers(HttpMethod.PUT, PermitUrl.PUT_URLS).permitAll()
                        // DELETE 요청 허용
                        .requestMatchers(HttpMethod.DELETE, PermitUrl.DELETE_URLS).permitAll()
                        // 모든 요청 허용 (ALL_URLS)
                        .requestMatchers(PermitUrl.ALL_URLS).permitAll()
                        // 나머지 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .formLogin( form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .formLogin(
                        AbstractHttpConfigurer::disable
                )
                .sessionManagement((sessionManagement) -> sessionManagement
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .oauth2Login( oauth2Login ->
                        oauth2Login.successHandler(customOauth2AuthenticationSuccessHandler)
                                .authorizationEndpoint( authorizationEndpoint ->
                                        authorizationEndpoint
                                                .authorizationRequestResolver(customAuthorizationRequestResolver)
                                )
                );

        ; //h2-console 접근 허용
        return http.build();
    }
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); // 프론트 도메인
        config.setAllowedMethods(List.of("GET", "POST", "OPTIONS", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager(); // 빈 등록만 하고 사용자 추가 X
    }


}
