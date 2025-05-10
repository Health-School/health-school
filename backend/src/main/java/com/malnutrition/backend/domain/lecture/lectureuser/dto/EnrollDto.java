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
    private LocalDateTime startDate;
}
