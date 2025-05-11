package com.malnutrition.backend.domain.machine.machine.service;

import com.malnutrition.backend.domain.machine.machine.dto.MachineResponseDto;
import com.malnutrition.backend.domain.machine.machine.entity.Machine;
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

    @Transactional(readOnly = true)
    public MachineResponseDto getMachineDetailById(Long machineId) {
        Machine machine = machineRepository.findByIdAndApprovedTrue(machineId)
                .orElseThrow(() -> new IllegalArgumentException("승인된 운동기구만 조회할 수 있습니다."));

        List<String> bodyNames = machine.getMachineBodies().stream()
                .map(mb -> mb.getBody().getName())
                .collect(Collectors.toList());

        return new MachineResponseDto(
                machine.getId(),
                machine.getName(),
                bodyNames,
                machine.getMachineType().getName()
        );
    }



}
