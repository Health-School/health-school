package com.malnutrition.backend.global.rq;

import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.security.security.SecurityUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RequestScope
@Component
@RequiredArgsConstructor
public class Rq {
    private final HttpServletRequest req;
    private final HttpServletResponse resp;
    private final UserService userService;
    @Value("${cookie.domain}")
    private String cookieDomain;

    public void setLogin(User user) {
        User contextUser = userService.findById(user.getId()).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 userId 입니다."));
        if (contextUser.getUserStatus() == UserStatus.BANNED) {
            throw new AccessDeniedException("정지된 회원입니다."); // 403 에러 발생
        }

        UserDetails securityUser = new SecurityUser(
                contextUser.getId(),
                contextUser.getEmail(),
                "",
                contextUser.getNickname(),
                contextUser.getAuthorities()
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                securityUser,
                securityUser.getPassword(),
                securityUser.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public User getActor() {
        return Optional.ofNullable(
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                )
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof SecurityUser)
                .map(principal -> (SecurityUser) principal)
//                .map(securityUser -> new User(securityUser.getId(), securityUser.getUsername(), securityUser.getNickname() ))
                .map(securityUser -> userService.findById(securityUser.getId()).orElse(null)) // 수정된 부분
                .orElse(null);
    }

    public void setCookie(String name, String value) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .domain(cookieDomain)
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .build();
        resp.addHeader("Set-Cookie", cookie.toString());
    }

    public String getCookieValue(String name) {
        return Optional
                .ofNullable(req.getCookies())
                .stream() // 1 ~ 0
                .flatMap(cookies -> Arrays.stream(cookies))
                .filter(cookie -> cookie.getName().equals(name))
                .map(cookie -> cookie.getValue())
                .findFirst()
                .orElse(null);
    }

    public void deleteCookie(String name) {
        ResponseCookie cookie = ResponseCookie.from(name, null)
                .path("/")
                .domain(cookieDomain)
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(0)
                .build();

        resp.addHeader("Set-Cookie", cookie.toString());
    }

    public void setHeader(String name, String value) {
        resp.setHeader(name, value);
    }

    public String getHeader(String name) {
        return req.getHeader(name);
    }

    public void refreshAccessToken(User user) {
        String newAccessToken = userService.genAccessToken(user);

        setHeader("Authorization", "Bearer " + user.getRefreshToken() + " " + newAccessToken);
        setCookie("accessToken", newAccessToken);
    }
    public String makeAuthCookie(User user) {
        String accessToken = userService.genAccessToken(user);

        setCookie("refreshToken", user.getRefreshToken());
        setCookie("accessToken", accessToken);

        return accessToken;
    }
}
