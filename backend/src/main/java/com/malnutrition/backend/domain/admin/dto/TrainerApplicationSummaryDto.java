package com.malnutrition.backend.domain.admin.dto;

import com.malnutrition.backend.domain.admin.enums.TrainerVerificationResult;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TrainerApplicationSummaryDto {

    private Long applicationId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhoneNumber;
    private LocalDateTime applicationDate;
    private TrainerVerificationResult status;

}
