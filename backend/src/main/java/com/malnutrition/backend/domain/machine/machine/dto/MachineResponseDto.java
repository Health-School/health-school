package com.malnutrition.backend.domain.machine.machine.dto;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machinebody.entity.MachineBody;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class MachineResponseDto {
    private Long id;
    private String name;
    private List<String> body;  // 예: ["가슴", "등"]
    private String type;        // 예: "프리웨이트"

    public static MachineResponseDto from(Machine machine) {
        return new MachineResponseDto(
                machine.getId(),
                machine.getName(),
                machine.getMachineBodies().stream()
                        .map(body -> body.getBody().getName()) // 람다로 직접 명시
                        .collect(Collectors.toList()),
                machine.getMachineType().getName()
        );
    }
}

