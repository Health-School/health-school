package com.malnutrition.backend.domain.user.exercisesheet.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ExerciseSheetResponseDto {
    private LocalDate exerciseDate;
    private LocalTime exerciseStartTime;
    private LocalTime exerciseEndTime;
    private List<MachineExerciseSheetResponseDto> machineExercises;
}
