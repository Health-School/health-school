package com.malnutrition.backend.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainerInfoDto {
    String name;
    long studentCount;
    double averageLectureScore;
    String profileImagePath;

    public static TrainerInfoDto from(TrainerInfoProcessDto trainerInfoProcessDto, String profileImagePath){
        return TrainerInfoDto.builder()
                .name(trainerInfoProcessDto.getName())
                .studentCount(trainerInfoProcessDto.getStudentCount())
                .averageLectureScore(trainerInfoProcessDto.getAverageLectureScore())
                .profileImagePath(profileImagePath)
                .build();
    }
}
