package com.malnutrition.backend.domain.user.exerciseFeedback.dto;
import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FeedbackDto {

    private Long id;
    private Long exerciseSheetId;
    private Long trainerId;
    private String trainerName;
    private String comment;
    private LocalDateTime createdAt;

    public static FeedbackDto fromEntity(ExerciseFeedback feedback) {
        return FeedbackDto.builder()
                .id(feedback.getId())
                .exerciseSheetId(feedback.getExerciseSheet().getId())
                .trainerId(feedback.getTrainer().getId())
                .trainerName(feedback.getTrainer().getNickname()) // 닉네임 필드에 따라 수정
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedDate())
                .build();
    }
}

