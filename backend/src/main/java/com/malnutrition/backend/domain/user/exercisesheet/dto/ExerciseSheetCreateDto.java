package com.malnutrition.backend.domain.user.exercisesheet.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@NoArgsConstructor
public class ExerciseSheetCreateDto {
    private LocalDate exerciseDate;
    private LocalTime exerciseStartTime;
    private LocalTime exerciseEndTime;
    private List<MachineExerciseSheetCreateDto> machineExercises;
}
