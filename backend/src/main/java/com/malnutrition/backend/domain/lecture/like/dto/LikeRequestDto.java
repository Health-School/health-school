package com.malnutrition.backend.domain.lecture.like.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;

@Getter
public class LikeRequestDto {

    Long lectureId;

}
