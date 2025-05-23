package com.malnutrition.backend.domain.admin.user.dto;

import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserStatusUpdateRequestDto {

    @NotNull(message = "변경할 회원 상태는 필수입니다.")
    private UserStatus UserStatus;
}
