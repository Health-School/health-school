package com.malnutrition.backend.domain.lecture.like.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor

public class LikeUpdateRequestDto {
    Long lectureId;
    @Min(0)
    @Max(5)
    int score;
}
