package com.malnutrition.backend.domain.user.email.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EmailVerificationDto {

    @NotBlank(message = "email은 필수입니다.")
    String email;
    @NotBlank(message = "code는 필수입니다.")
    String code;
}
