package com.malnutrition.backend.domain.admin.dto;

import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserRoleUpdateRequestDto {

    @NotNull(message = "처리할 사용자 자격증 ID는 필수")
    private Long userCertificationId;

    @NotNull(message = "변경할 승인 상태는 필수")
    private ApproveStatus targetApproveStatus;
}
