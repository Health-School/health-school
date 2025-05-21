package com.malnutrition.backend.domain.lecture.lectureuser.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class EnrollDto {
    private Long lectureId;
    private String trainerName;
    private String lectureName;
    private String lectureLevel;
    private String userName;
    private LocalDateTime startDate; //강의 생성일
    private int progressRate; // 진행률 퍼센트로 나타내기 위해
    private LocalDateTime createdDate; //강의 수강 시작일
    private String coverImageUrl;
}