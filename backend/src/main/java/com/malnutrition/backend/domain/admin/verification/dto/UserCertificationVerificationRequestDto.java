package com.malnutrition.backend.domain.admin.verification.dto;

import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserCertificationVerificationRequestDto {

    @NotNull(message = "변경할 검토 상태는 필수입니다.")
    private ApproveStatus reviewStatus;

    private String reason;
}
