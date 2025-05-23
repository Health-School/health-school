package com.malnutrition.backend.domain.lecture.curriculumProgress.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumProgressRequestDto {

    @NotNull
    @Min(0)
    private Integer totalWatchedSeconds;

    @NotNull
    @Min(0)
    private Integer lastWatchedSecond;

    private Integer duration;

}
