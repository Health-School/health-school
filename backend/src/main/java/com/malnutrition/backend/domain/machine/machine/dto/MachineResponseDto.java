package com.malnutrition.backend.domain.machine.machine.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MachineResponseDto {
    private Long id;
    private String name;
    private List<String> body;         // 부위 (예: 가슴, 등, 다리 등)
    private String type;         // 타입 (예: 머신, 프리웨이트 등)
}
