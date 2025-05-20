package com.malnutrition.backend.domain.admin.verification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SubmittedCertificationResponseDto {

    private Long userCertificationId;
    private String certificationName;
    private String issuingInstitution;
    private LocalDate acquisitionDate;
    private LocalDate expirationDate;
    private String approveStatus;
    private String adminComment;
    private String certificationImageUrl; // 자격증 이미지 미리보기용
    private String certificationFileDownloadUrl; // 자격증 파일 다운로드 URL
}
