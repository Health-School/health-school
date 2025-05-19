package com.malnutrition.backend.domain.user.sms.controller;

import com.malnutrition.backend.domain.user.sms.dto.SmsRequestDto;
import com.malnutrition.backend.domain.user.sms.dto.SmsVerificationRequestDto;
import com.malnutrition.backend.domain.user.sms.service.SmsService;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.exception.NurigoEmptyResponseException;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.exception.NurigoUnknownException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sms")
@RequiredArgsConstructor
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@RequestBody SmsRequestDto smsRequestDto) throws NurigoMessageNotReceivedException, NurigoEmptyResponseException, NurigoUnknownException {

        smsService.sendVerificationCode(smsRequestDto.getPhoneNumber());
        return ResponseEntity.ok("인증번호 전송 완료");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody SmsVerificationRequestDto smsVerificationRequestDto) {
        boolean verifyCode = smsService.verifyCode(smsVerificationRequestDto.getPhoneNumber(), smsVerificationRequestDto.getCode());
        if (verifyCode) {
            return ResponseEntity.ok("인증 성공");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패");
        }
    }

}
