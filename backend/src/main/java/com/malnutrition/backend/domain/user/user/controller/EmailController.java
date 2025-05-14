package com.malnutrition.backend.domain.user.user.controller;


import com.malnutrition.backend.domain.user.user.dto.EmailVerificationDto;
import com.malnutrition.backend.domain.user.user.dto.UserEmailDto;
import com.malnutrition.backend.domain.user.user.service.EmailService;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/email")
@Slf4j
public class EmailController {

    private final EmailService emailService;
    private final UserService userService;

    @PostMapping("/join/send")
    public ResponseEntity<ApiResponse<String>> sendCodeByJoin(@RequestBody UserEmailDto userEmailDto) {
        String email = userEmailDto.getEmail();
        log.info("your email1 {}", email);
        if(userService.emailExists(email)) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.fail("이미 사용 중인 이메일입니다."));
        }
        emailService.sendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success(null, "이메일 전송 성공"));
    }
    //    비밀번호 찾기용 인증 메서드
    @PostMapping("/password/send")
    public ResponseEntity<ApiResponse<String>> sendCodeByFindPassword(@RequestBody UserEmailDto userEmailDto){
        String email = userEmailDto.getEmail();
        if(!userService.emailExists(email)) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.fail("존재하지 않는 email 입니다."));
        }
        emailService.sendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success(null, "이메일 전송 성공"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody EmailVerificationDto emailVerificationDto) {
        boolean result = emailService.verifyCode(emailVerificationDto.getEmail(), emailVerificationDto.getCode());
        if (result) {
            return ResponseEntity.ok(ApiResponse.success(null, "인증 성공"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.success(null, "인증 실패"));
        }
    }
}