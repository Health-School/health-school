package com.malnutrition.backend.domain.user.sms.controller;

import com.malnutrition.backend.domain.user.sms.service.SmsService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coolsms")
public class SmsController {

//    private final SmsService smsService;
//    private final RedisTemplate<String, String> redisTemplate;
//
//    public AuthController(SmsService smsService, RedisTemplate<String, String> redisTemplate) {
//        this.smsService = smsService;
//        this.redisTemplate = redisTemplate;
//    }
//
//    @PostMapping("/send-code")
//    public ResponseEntity<?> sendCode(@RequestParam String phoneNumber) {
//        String code = AuthUtil.generateCode();
//
//        // Redis에 저장: 3분 동안 유효
//        redisTemplate.opsForValue().set("auth:" + phoneNumber, code, Duration.ofMinutes(3));
//
//        smsService.sendVerificationCode(phoneNumber, code);
//        return ResponseEntity.ok("인증번호 전송 완료");
//    }
//
//    @PostMapping("/verify-code")
//    public ResponseEntity<?> verifyCode(@RequestParam String phoneNumber, @RequestParam String code) {
//        String savedCode = redisTemplate.opsForValue().get("auth:" + phoneNumber);
//        if (code.equals(savedCode)) {
//            return ResponseEntity.ok("인증 성공");
//        } else {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패");
//        }
//    }
}
