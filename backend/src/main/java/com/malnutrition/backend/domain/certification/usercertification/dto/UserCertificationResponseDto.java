package com.malnutrition.backend.domain.certification.usercertification.dto;

import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.image.entity.Image;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserCertificationResponseDto {

    private Long certificationId;
    private String certificationName; // Certification 엔티티에 name 필드가 있다고 가정
    private ApproveStatus approveStatus;
    private String imageUrl;
    private LocalDate acquisitionDate;
    private LocalDate expirationDate;
    private String adminComment;
}