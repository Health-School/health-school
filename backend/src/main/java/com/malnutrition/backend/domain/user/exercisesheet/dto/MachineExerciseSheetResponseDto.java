package com.malnutrition.backend.domain.user.exercisesheet.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MachineExerciseSheetResponseDto {
    private Long id;
    private Long writerId;
    private String writerName;
    private String machineName;
    private int reps;
    private int sets;
    private int weight;
}
