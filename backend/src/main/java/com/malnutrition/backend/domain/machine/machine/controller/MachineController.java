package com.malnutrition.backend.domain.machine.machine.controller;

import com.malnutrition.backend.domain.machine.machine.dto.MachineRegisterRequest;
import com.malnutrition.backend.domain.machine.machine.dto.MachineResponseDto;
import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machine.service.MachineService;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    // Body ID로 조회
    @GetMapping("/by-body")
    public ResponseEntity<?> getMachinesByBodyId(
            @RequestParam Long bodyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MachineResponseDto> result = machineService.getMachinesByBodyId(bodyId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "운동기구 조회 성공 (Body ID)"));
    }

    // MachineType ID로 조회
    @GetMapping("/by-type")
    public ResponseEntity<?> getMachinesByTypeId(
            @RequestParam Long typeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MachineResponseDto> result = machineService.getMachinesByTypeId(typeId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "운동기구 조회 성공 (Type ID)"));
    }

    // Body ID + MachineType ID 같이 조회 (필요하면)
    @GetMapping("/by-body-and-type")
    public ResponseEntity<?> getMachinesByBodyAndType(
            @RequestParam Long bodyId,
            @RequestParam Long typeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MachineResponseDto> result = machineService.getMachinesByBodyIdAndTypeId(bodyId, typeId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "운동기구 조회 성공 (Body ID + Type ID)"));
    }
}
