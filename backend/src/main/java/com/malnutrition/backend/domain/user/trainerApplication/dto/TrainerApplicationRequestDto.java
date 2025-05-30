package com.malnutrition.backend.domain.user.trainerApplication.dto;

import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.trainerApplication.enums.TrainerVerificationStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TrainerApplicationRequestDto {

    private String name; //신청서 이름
    private String careerHistory; // 경력 사항
    private String expertiseAreas; // 전문 분야
    private String selfIntroduction; // 자기 소개

    private List<CertificationItemDto> certifications;

}
