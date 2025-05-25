package com.malnutrition.backend.domain.lecture.like.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor

public class LikeUpdateRequestDto {
    Long likeId;
    int score;
}
