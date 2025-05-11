package com.malnutrition.backend.domain.user.exercisesheet.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MachineExerciseSheetDto {
    private Long exerciseSheetId;  // 운동 기록 ID
    private String createdDate;    // 작성일자
    private String modifiedDate;   // 수정일자
}
