package com.malnutrition.backend.domain.admin.verification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class TrainerApplicationDetailResponseDto {

    private Long applicationId;
    private ApplicantUserInfoDto applicantUserInfo;
    private LocalDate applicationDate;
    private String applicationStatus;

    private String careerHistory;
    private String expertiseAreas;
    private String selfIntroduction;

    private List<SubmittedCertificationResponseDto> submittedCertifications;
}
