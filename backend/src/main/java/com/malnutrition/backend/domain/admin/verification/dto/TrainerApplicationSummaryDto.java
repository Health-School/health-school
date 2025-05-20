package com.malnutrition.backend.domain.admin.verification.dto;

import com.malnutrition.backend.domain.user.trainerApplication.enums.TrainerVerificationStatus;
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
    private TrainerVerificationStatus status;

}
