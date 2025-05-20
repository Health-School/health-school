package com.malnutrition.backend.domain.admin.verification.dto;

import com.malnutrition.backend.domain.user.trainerApplication.enums.TrainerVerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TrainerVerificationRequestDto {

    @NotNull(message = "트레이너 검증 결과는 필수입니다.")
    private TrainerVerificationStatus result;

    private String reason;
}
