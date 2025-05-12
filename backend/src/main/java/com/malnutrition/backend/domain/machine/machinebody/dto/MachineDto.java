package com.malnutrition.backend.domain.machine.machinebody.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MachineDto {
    private Long id;
    private String name;
    private String machineTypeName;
    private boolean approved;
}
