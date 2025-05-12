package com.malnutrition.backend.domain.machine.machine.controller;

import com.malnutrition.backend.domain.machine.machine.dto.MachineRegisterRequest;
import com.malnutrition.backend.domain.machine.machine.dto.MachineResponseDto;
import com.malnutrition.backend.domain.machine.machine.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    public ResponseEntity<List<MachineResponseDto>> getAllMachines() {
        List<MachineResponseDto> machines = machineService.getAllApprovedMachines();
        return ResponseEntity.ok(machines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMachineDetail(@PathVariable Long id) {
        try {
            MachineResponseDto dto = machineService.getMachineDetailById(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerMachine(@RequestBody MachineRegisterRequest request) {
        try {
            return ResponseEntity.ok(machineService.registerMachine(request));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "서버 오류"));
        }
    }
}
