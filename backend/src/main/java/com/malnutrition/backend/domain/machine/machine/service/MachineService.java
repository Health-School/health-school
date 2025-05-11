package com.malnutrition.backend.domain.machine.machine.service;

import com.malnutrition.backend.domain.machine.machine.dto.MachineResponseDto;
import com.malnutrition.backend.domain.machine.machine.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;

    @Transactional(readOnly = true)
    public List<MachineResponseDto> getAllApprovedMachines() {
        return machineRepository.findByApprovedTrue().stream()
                .map(machine -> {
                    List<String> bodyNames = machine.getMachineBodies().stream()
                            .map(mb -> mb.getBody().getName())
                            .collect(Collectors.toList());

                    return new MachineResponseDto(
                            machine.getId(),
                            machine.getName(),
                            bodyNames,
                            machine.getMachineType().getName()
                    );
                })
                .collect(Collectors.toList());
    }

}
