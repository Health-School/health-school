package com.malnutrition.backend.domain.admin.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;


@Getter
@Builder
public class AdminLectureDto {
    private Long lectureId;
    private String title;
    private Long totalStudentCount;
    private Double averageRating;
    private LocalDate createdDate;
    private String status;
}
