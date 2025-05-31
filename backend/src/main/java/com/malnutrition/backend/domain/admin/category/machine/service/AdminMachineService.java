package com.malnutrition.backend.domain.admin.category.machine.service;

import com.malnutrition.backend.domain.admin.category.machine.dto.AdminMachineRequestDto;
import com.malnutrition.backend.domain.machine.body.entity.Body;
import com.malnutrition.backend.domain.machine.body.repository.BodyRepository;
import com.malnutrition.backend.domain.machine.machine.dto.MachineRegisterRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminMachineService {

    private final MachineRepository machineRepository;
    private final MachineTypeRepository machineTypeRepository;
    private final BodyRepository bodyRepository;
    private final MachineBodyRepository machineBodyRepository;
    private final Rq rq;


    private void checkAdmin() {
        User user = rq.getActor();
        if (user == null || !user.getRole().name().equals("ADMIN")) {
            throw new SecurityException("관리자 권한이 필요합니다.");
        }
    }


    // 신청 운동 기구 승인
    public void approveMachineRequest(Long machineId) {
        checkAdmin();

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구를 찾을 수 없습니다."));

        if(machine.isApproved()) {
            System.out.println("이미 승인된 운동기구입니다. ID: " + machineId);
        }

        machine.setApproved(true);
        machineRepository.save(machine);
    }

    // 1. 운동 기구 등록 (관리자 직접 등록)

    public MachineDto registerMachineByAdmin(MachineRegisterRequest request) {
        checkAdmin(); // 관리자 권한 확인
        User adminUser = rq.getActor(); // 현재 관리자 정보 가져오기

        if (machineRepository.existsByName(request.getName())) {
             throw new IllegalArgumentException("이미 존재하는 운동기구 이름입니다: " + request.getName());
         }

        MachineType type = machineTypeRepository.findById(request.getMachineTypeId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 기구 타입 ID입니다: " + request.getMachineTypeId()));

        Machine machine = Machine.builder()
                .name(request.getName())
                .user(adminUser) // 신청자를 현재 관리자로 설정
                .machineType(type)
                .approved(true) // 관리자가 직접 등록하므로 바로 승인
                .machineBodies(new ArrayList<>()) // 빈 리스트로 초기화
                .build();

        for (Long bodyId : request.getBodyIds()) {
            Body body = bodyRepository.findById(bodyId)
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 운동 부위 ID입니다: " + bodyId));

            MachineBody machineBody = MachineBody.builder()
                    .machine(machine)
                    .body(body)
                    .build();
            machine.getMachineBodies().add(machineBody);
        }

        Machine savedMachine = machineRepository.save(machine);

        return new MachineDto(savedMachine.getId(), savedMachine.getName(), savedMachine.getMachineType().getName(), savedMachine.isApproved());
    }


    // 2. 운동 기구 조회
    @Transactional(readOnly = true)
    public Page<AdminMachineRequestDto> getMachineRequests(Pageable pageable, String approveStatusFilter) {
        checkAdmin();
        Page<Machine> machinePage;

        if("APPROVED".equalsIgnoreCase(approveStatusFilter))
            machinePage = machineRepository.findAllByApproved(true, pageable);
        else if("PENDING".equalsIgnoreCase(approveStatusFilter))
            machinePage = machineRepository.findAllByApproved(false, pageable);
        else
            machinePage = machineRepository.findAll(pageable);

        return machinePage.map(AdminMachineRequestDto::from);
    }


    // 3. 운동 기구 수정
    public MachineDto updateMachine(Long machineId, String name, Long machineTypeId, List<Long> bodyIds) {
        checkAdmin();

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구가 존재하지 않습니다."));

        MachineType newType = machineTypeRepository.findById(machineTypeId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구 타입이 존재하지 않습니다."));

        machine.setName(name);
        machine.setMachineType(newType);

        if (!machine.isApproved()) // 만약 미승인 상태였다면 승인 상태로 변경
            machine.setApproved(true);


        machine.getMachineBodies().clear();

        for(Long bodyId : bodyIds) {
            Body body = bodyRepository.findById(bodyId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 운동 부위가 존재하지 않습니다. ID: " + bodyId));

            MachineBody machineBody = MachineBody.builder()
                    .machine(machine)
                    .body(body)
                    .build();

            machine.getMachineBodies().add(machineBody);
        }
        Machine updatedMachine = machineRepository.save(machine);

        return new MachineDto(updatedMachine.getId(), updatedMachine.getName(),updatedMachine.getMachineType().getName(), updatedMachine.isApproved());

    }


    // 4. 운동 기구 삭제
    public void deleteMachine(Long machineId) {
        checkAdmin();

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구가 존재하지 않습니다."));

        machineRepository.delete(machine);
    }






}
