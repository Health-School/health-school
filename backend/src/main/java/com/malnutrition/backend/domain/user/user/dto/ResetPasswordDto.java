package com.malnutrition.backend.domain.user.user.dto;

import lombok.Getter;

@Getter
public class ResetPasswordDto {
    String password;

    public ResetPasswordDto(String password) {
        this.password = password;
    }
}
