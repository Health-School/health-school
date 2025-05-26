package com.malnutrition.backend.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ResetPasswordDto {
    String password;

    public ResetPasswordDto(String password) {
        this.password = password;
    }
}
