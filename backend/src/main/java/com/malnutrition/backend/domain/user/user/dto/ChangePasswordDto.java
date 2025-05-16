package com.malnutrition.backend.domain.user.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordDto {
    @NotBlank(message = "현재 비밀번호를 입력하세요.")
    String currentPassword;
    @NotBlank(message = "새로운 비밀번호를 입력하세요.")
    String newPassword;
    @NotBlank(message = "확인 비밀번호를 입력하세요. ")
    String confirmPassword;
}
