package com.malnutrition.backend.domain.user.exercisesheet.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MachineExerciseSheetCreateDto {
    private Long machineId;
    private Integer reps;
    private Integer weight;
    private Integer sets;
}
