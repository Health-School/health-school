package com.malnutrition.backend.domain.user.trainerApplication.dto;

import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.trainerApplication.enums.TrainerVerificationStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Getter
public class TrainerApplicationRequestDto {

    private String name; //신청서 이름
    private String certificationName; // 자격증 이름
    private String careerHistory; // 경력 사항
    private String expertiseAreas; // 전문 분야
    private String selfIntroduction; // 자기 소개
    private String issuingInstitution; // 발급처
    private LocalDate acquisitionDate; // 발급일, 날짜 형식: 2012-12-10
    private LocalDate expirationDate; // 만료일, 날짜 형식: 2012-12-10
    //이미지는 따로 받아야함

    public static TrainerApplication from (TrainerApplicationRequestDto trainerApplicationRequestDto, User user){

        return TrainerApplication.builder()
                .user(user)
                .name(trainerApplicationRequestDto.getName())
                .careerHistory(trainerApplicationRequestDto.careerHistory)
                .selfIntroduction(trainerApplicationRequestDto.selfIntroduction)
                .expertiseAreas(trainerApplicationRequestDto.expertiseAreas)
                .verificationResult(TrainerVerificationStatus.PENDING_VERIFICATION)
                .build();

    }
}
