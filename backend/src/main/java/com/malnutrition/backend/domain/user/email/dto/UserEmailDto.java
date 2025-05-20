package com.malnutrition.backend.domain.user.email.dto;

import lombok.Getter;

@Getter
public class UserEmailDto {

    String email;

    public UserEmailDto(String email) {
        this.email = email;
    }
}
