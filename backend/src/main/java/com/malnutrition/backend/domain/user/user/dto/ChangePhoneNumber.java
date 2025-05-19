package com.malnutrition.backend.domain.user.user.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class ChangePhoneNumber {
    @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "전화번호는 010-XXXX-XXXX 형식이어야 합니다.")
    String phoneNumber;
}
