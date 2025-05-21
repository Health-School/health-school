package com.malnutrition.backend.domain.user.exercisesheet.dto;

import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class ExerciseSheetResponseDto {
    private Long id;
    private LocalDate exerciseDate;
    private LocalTime exerciseStartTime;
    private LocalTime exerciseEndTime;
    private List<MachineExerciseSheetResponseDto> machineExercises;

    
}
