package com.malnutrition.backend.domain.admin.category.machine.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MachineUpdateRequestDto {

    @NotBlank(message = "기구 이름은 필수입니다.")
    private String name;

    @NotNull(message = "기구 타입 ID는 필수입니다.")
    private Long machineTypeId;

    @NotEmpty(message = "운동 부위 ID 목록은 최소 하나 이상이어야 합니다.")
    private List<Long> bodyIds;
}
