package com.malnutrition.backend.domain.machine.machinetype.service;

import com.malnutrition.backend.domain.machine.machinetype.dto.MachineTypeDto;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import com.malnutrition.backend.domain.machine.machinetype.repository.MachineTypeRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineTypeService {

    private final MachineTypeRepository machineTypeRepository;
    private final Rq rq;

    private void checkAdmin(User user) {
        if (!user.getRole().name().equals("ADMIN")) {
            throw new SecurityException("관리자 권한이 필요합니다.");
        }
    }

    @Transactional
    public MachineTypeDto createType(String name) {
        User user = rq.getActor();
        checkAdmin(user);

        if (machineTypeRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 타입 이름입니다.");
        }

        MachineType type = MachineType.builder().name(name).build();
        machineTypeRepository.save(type);

        return new MachineTypeDto(type.getId(), type.getName());
    }


    @Transactional(readOnly = true)
    public List<MachineTypeDto> getAllTypes() {
        return machineTypeRepository.findAll().stream()
                .map(t -> new MachineTypeDto(t.getId(), t.getName()))
                .toList();
    }

    @Transactional
    public MachineTypeDto updateType(Long id, String newName) {
        User user = rq.getActor();
        checkAdmin(user);

        if (machineTypeRepository.findByName(newName).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 타입 이름입니다.");
        }

        MachineType type = machineTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 타입이 존재하지 않습니다."));

        type.setName(newName);
        return new MachineTypeDto(type.getId(), type.getName());
    }

    @Transactional
    public void deleteType(Long id) {
        User user = rq.getActor();
        checkAdmin(user);

        MachineType type = machineTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 타입이 존재하지 않습니다."));

        machineTypeRepository.delete(type);
    }
}
