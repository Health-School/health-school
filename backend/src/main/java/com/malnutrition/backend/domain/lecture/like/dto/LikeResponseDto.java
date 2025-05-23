package com.malnutrition.backend.domain.lecture.like.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@NoArgsConstructor
@Setter
public class LikeResponseDto {


    @Min(0)
    @Max(5)
    double average;

    public LikeResponseDto(double average) {
        this.average = average;
    }
}
