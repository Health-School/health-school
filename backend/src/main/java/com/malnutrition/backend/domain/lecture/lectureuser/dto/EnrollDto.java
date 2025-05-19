package com.malnutrition.backend.domain.lecture.lectureuser.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EnrollDto {
    private Long lectureId;
    private String trainerName;
    private String lectureName;
    private String lectureLevel;
    private String userName;
    private LocalDateTime startDate; //강의 생성일
      private int progressRate; // 진행률 퍼센트로 나타내기 위해
    private LocalDateTime createdDate; //강의 수강 시작일
}
