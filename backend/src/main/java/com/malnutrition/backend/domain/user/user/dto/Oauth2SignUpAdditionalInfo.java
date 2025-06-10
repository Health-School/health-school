package com.malnutrition.backend.domain.user.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class Oauth2SignUpAdditionalInfo {
    @Pattern(regexp = "^010\\d{8}$", message = "휴대폰 번호는 010으로 시작하고 총 11자리여야 합니다.")
    String phoneNumber;
    @NotBlank(message = "닉네임은 빈칸일 수 없습니다.")
    String nickname;
}
