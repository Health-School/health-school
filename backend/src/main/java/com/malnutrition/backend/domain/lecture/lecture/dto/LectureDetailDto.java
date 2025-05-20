package com.malnutrition.backend.domain.lecture.lecture.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LectureDetailDto {
    private Long id;
    private String title;
    private String content;
    private Long price;
    private String lectureStatus;
    private String lectureLevel;
    private String trainerName;
    private String trainerProfileImageUrl;
    private String categoryName;
    private String coverImageUrl;
    private Double averageScore;
    private LocalDateTime createdAt;
}