package com.malnutrition.backend.domain.admin.dto;

import com.malnutrition.backend.domain.admin.enums.TrainerVerificationResult;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TrainerVerificationRequestDto {

    @NotNull(message = "트레이너 검증 결과는 필수입니다.")
    private TrainerVerificationResult result;

    private String reason;
}
