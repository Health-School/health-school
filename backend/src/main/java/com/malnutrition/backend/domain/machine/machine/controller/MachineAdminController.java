package com.malnutrition.backend.domain.machine.machine.controller;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machine.repository.MachineRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/machines")
public class MachineAdminController {

    private final MachineRepository machineRepository;
    private final Rq rq; // 로그인된 사용자 정보

    @PutMapping("/{machineId}")
    public ResponseEntity<?> approveMachine(@PathVariable Long machineId) {
        // 로그인한 사용자 정보 가져오기
        User user = rq.getActor();

        // 관리자인지 확인
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        // 운동기구 찾기
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new IllegalArgumentException("운동기구를 찾을 수 없습니다."));

        // 승인 상태로 변경
        machine.setApproved(true);
        machineRepository.save(machine);

        return ResponseEntity.ok("운동기구 승인이 완료되었습니다.");
    }
}

