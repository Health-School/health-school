package com.malnutrition.backend.domain.machine.machine.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class MachineRegisterRequest {
    private String name;
    private Long machineTypeId;
    private List<Long> bodyIds;
}
