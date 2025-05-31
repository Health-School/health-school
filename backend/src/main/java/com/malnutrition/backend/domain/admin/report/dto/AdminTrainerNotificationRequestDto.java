package com.malnutrition.backend.domain.admin.report.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminTrainerNotificationRequestDto {

    @NotBlank(message = "강사에게 전달할 메시지를 입력해주세요.")
    private String message;
}
