package com.malnutrition.backend.domain.user.sms.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class SmsRequestDto {
    @Pattern(regexp = "^010\\d{8}$", message = "휴대폰 번호는 010으로 시작하고 총 11자리여야 합니다.")
    String phoneNumber;
}
