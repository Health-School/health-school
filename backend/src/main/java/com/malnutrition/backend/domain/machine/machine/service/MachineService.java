package com.malnutrition.backend.domain.machine.machine.service;

import com.malnutrition.backend.domain.machine.body.entity.Body;
import com.malnutrition.backend.domain.machine.body.repository.BodyRepository;
import com.malnutrition.backend.domain.machine.machine.dto.MachineRegisterRequest;
import com.malnutrition.backend.domain.machine.machine.dto.MachineResponseDto;
import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machine.repository.MachineRepository;
import com.malnutrition.backend.domain.machine.machinebody.dto.MachineDto;
import com.malnutrition.backend.domain.machine.machinebody.entity.MachineBody;
import com.malnutrition.backend.domain.machine.machinebody.repository.MachineBodyRepository;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import com.malnutrition.backend.domain.machine.machinetype.repository.MachineTypeRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final MachineTypeRepository machineTypeRepository;
    private final MachineBodyRepository machineBodyRepository;
    private final BodyRepository bodyRepository;
    private final Rq rq;

    private void checkAdmin(User user) {
        if (!user.getRole().name().equals("ADMIN")) {
            throw new SecurityException("관리자 권한이 필요합니다.");
        }
    }

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

    @Transactional
    public MachineDto updateMachine(Long machineId, String name, Long machineTypeId, List<Long> bodyIds) {
        User user = rq.getActor();
        checkAdmin(user);

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구가 존재하지 않습니다."));

        MachineType newType = machineTypeRepository.findById(machineTypeId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구 타입이 존재하지 않습니다."));

        machine.setName(name);
        machine.setMachineType(newType);

        // 기존 machineBodies 삭제
        machine.getMachineBodies().clear();
        machineBodyRepository.deleteAllByMachine(machine);

        // 새로운 body 매핑
        for (Long bodyId : bodyIds) {
            Body body = bodyRepository.findById(bodyId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 Body가 존재하지 않습니다."));
            MachineBody machineBody = MachineBody.builder()
                    .machine(machine)
                    .body(body)
                    .build();
            machine.getMachineBodies().add(machineBody);
        }

        return new MachineDto(machine.getId(), machine.getName(), machine.getMachineType().getName(), machine.isApproved());
    }

    // 기구 삭제
    @Transactional
    public void deleteMachine(Long machineId) {
        User user = rq.getActor();
        checkAdmin(user);

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구가 존재하지 않습니다."));

        machineRepository.delete(machine); // 연관된 machineBody도 같이 삭제됨
    }

    @Transactional
    public MachineDto registerMachine(MachineRegisterRequest request) {
        User user = rq.getActor();

        if (!user.getRole().name().equals("TRAINER")) {
            throw new SecurityException("트레이너 권한이 필요합니다.");
        }

        MachineType type = machineTypeRepository.findById(request.getMachineTypeId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 기구 타입입니다."));

        Machine machine = Machine.builder()
                .name(request.getName())
                .user(user)
                .machineType(type)
                .approved(false) // 요청 상태
                .machineBodies(new ArrayList<>())
                .build();

        machine = machineRepository.save(machine);

        for (Long bodyId : request.getBodyIds()) {
            Body body = bodyRepository.findById(bodyId)
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 운동 부위 ID입니다."));

            MachineBody machineBody = MachineBody.builder()
                    .machine(machine)
                    .body(body)
                    .build();

            machine.getMachineBodies().add(machineBody);
        }

        return new MachineDto(machine.getId(), machine.getName(), machine.getMachineType().getName(), machine.isApproved());
    }








}
