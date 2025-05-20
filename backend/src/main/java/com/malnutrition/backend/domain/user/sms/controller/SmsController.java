package com.malnutrition.backend.domain.user.sms.controller;

import com.malnutrition.backend.domain.user.sms.dto.SmsFindEmailResponseDto;
import com.malnutrition.backend.domain.user.sms.dto.SmsRequestDto;
import com.malnutrition.backend.domain.user.sms.dto.SmsVerificationRequestDto;
import com.malnutrition.backend.domain.user.sms.service.SmsService;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.rp.ApiResponse;
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
    private final UserService userService;
    @PostMapping("/join/send-code")
    public ResponseEntity<ApiResponse<Void>> sendCode(@RequestBody SmsRequestDto smsRequestDto) throws NurigoMessageNotReceivedException, NurigoEmptyResponseException, NurigoUnknownException {
        String phoneNumber = smsRequestDto.getPhoneNumber();
        if(userService.existsByPhoneNumber(phoneNumber)){
            return ResponseEntity.ok().body(ApiResponse.fail("이미 가입한 핸드폰 번호입니다."));
        }
        smsService.sendVerificationCode(phoneNumber);
        return ResponseEntity.ok(ApiResponse.success(null, "인증번호 전송 완료"));
    }

    @PostMapping("/join/verify-code")
    public ResponseEntity<ApiResponse<Void>> verifyCode(@RequestBody SmsVerificationRequestDto smsVerificationRequestDto) {
        boolean verifyCode = smsService.verifyCode(smsVerificationRequestDto.getPhoneNumber(), smsVerificationRequestDto.getCode());
        if (verifyCode) {
            return ResponseEntity.ok(ApiResponse.success(null, "인증 성공"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("인증 실패"));
        }
    }

    @PostMapping("/find-email/send-code")
    public ResponseEntity<ApiResponse<Void>> findEmail(@RequestBody SmsRequestDto smsRequestDto) throws NurigoMessageNotReceivedException, NurigoEmptyResponseException, NurigoUnknownException {
        String phoneNumber = smsRequestDto.getPhoneNumber();
        if(!userService.existsByPhoneNumber(phoneNumber)){
            return ResponseEntity.ok().body(ApiResponse.fail("존재하지 않는 핸드폰 번호입니다."));
        }
        smsService.sendVerificationCode(phoneNumber);
        return ResponseEntity.ok(ApiResponse.success(null, "인증번호 전송 완료"));
    }
    //아이디 찾기 성공하면 아이디 데이터 보내기
    @PostMapping("/find-email/verify-code")
    public ResponseEntity<ApiResponse<SmsFindEmailResponseDto>> findEmailVerifyCode(@RequestBody SmsVerificationRequestDto smsVerificationRequestDto) {
        String phoneNumber = smsVerificationRequestDto.getPhoneNumber();
        boolean verifyCode = smsService.verifyCode(phoneNumber, smsVerificationRequestDto.getCode());
        if (verifyCode) {
            String emailByPhoneNumber = userService.findEmailByPhoneNumber(phoneNumber);
            SmsFindEmailResponseDto dto = new SmsFindEmailResponseDto(emailByPhoneNumber);
            return ResponseEntity.ok(ApiResponse.success( dto,"인증 성공"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("인증 실패"));
        }
    }

}
