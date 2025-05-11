package com.malnutrition.backend.domain.machine.machinetype.entity;

import com.malnutrition.backend.domain.machine.machinetype.repository.MachineTypeRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MachineTypeInitializer {

    private final MachineTypeRepository machineTypeRepository;

    @PostConstruct
    public void initMachineTypes() {
        List<String> defaultTypes = List.of("덤벨", "바벨", "케틀벨", "머신", "밴드");

        for (String typeName : defaultTypes) {
            if (!machineTypeRepository.existsByName(typeName)) {
                machineTypeRepository.save(MachineType.builder()
                        .name(typeName)
                        .build());
            }
        }
    }
}
