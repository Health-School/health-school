package com.malnutrition.backend.domain.user.exercisesheet.dto;

import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class ExerciseSheetRespDto {
    private Long id;
    private Long userId;
    private String username;
    private LocalDate exerciseDate;
    private LocalTime exerciseStartTime;
    private LocalTime exerciseEndTime;

    public static ExerciseSheetRespDto from(ExerciseSheet sheet) {
        return ExerciseSheetRespDto.builder()
                .id(sheet.getId())
                .userId(sheet.getUser().getId())
                .username(sheet.getUser().getNickname())
                .exerciseDate(sheet.getExerciseDate())
                .exerciseStartTime(sheet.getExerciseStartTime())
                .exerciseEndTime(sheet.getExerciseEndTime())
                .build();
    }
}