package com.malnutrition.backend.domain.user.sms.dto;

import lombok.Getter;

@Getter
public class SmsVerificationRequestDto {
    String phoneNumber;
    String code;
}
