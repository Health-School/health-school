package com.malnutrition.backend.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class TrainerInfoProcessDto {
    String name;
    long studentCount;
    double averageLectureScore;
    Long imageId; // 또는 Image image;
    String imagePath;

    public TrainerInfoProcessDto(String name, Long studentCount, Double averageLectureScore, Long imageId, String imagePath) {
        this.name = name;
        this.studentCount = studentCount != null ? studentCount : 0;
        this.averageLectureScore = averageLectureScore != null ? averageLectureScore : 0.0;
        this.imageId = imageId;
        this.imagePath = imagePath;

    }
}
