package com.malnutrition.backend.domain.user.exerciseFeedback.dto;

import lombok.Data;

@Data
public class ExerciseFeedbackCreateDto {
    private Long sheetId;
    private String comment;
}