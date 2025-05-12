package com.malnutrition.backend.domain.machine.machinetype.controller;

import com.malnutrition.backend.domain.machine.machinetype.dto.MachineTypeDto;
import com.malnutrition.backend.domain.machine.machinetype.service.MachineTypeService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/machine-types")
@RequiredArgsConstructor
public class MachineTypeController {

    private final MachineTypeService machineTypeService;

    @PostMapping
    public ResponseEntity<?> createType(@RequestParam String name) {
        try {
            return ResponseEntity.ok(ApiResponse.success(machineTypeService.createType(name), "타입 생성 성공!"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTypes() {
        return ResponseEntity.ok(ApiResponse.success(machineTypeService.getAllTypes(), "타입 조회 성공!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateType(@PathVariable Long id, @RequestParam String name) {
        try {
            return ResponseEntity.ok(ApiResponse.success(machineTypeService.updateType(id, name), "타입 수정 성공!"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteType(@PathVariable Long id) {
        try {
            machineTypeService.deleteType(id);
            return ResponseEntity.ok(ApiResponse.success(null,"타입 삭제에 성공했습니다!!"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}
