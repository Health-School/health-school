package com.malnutrition.backend.domain.user.sms.dto;

import lombok.Getter;

@Getter
public class SmsFindEmailResponseDto {
    public SmsFindEmailResponseDto(String email) {
        this.email = email;
    }

    String email;
}
