package com.malnutrition.backend.domain.machine.machinetype.controller;

import com.malnutrition.backend.domain.machine.machinetype.dto.MachineTypeDto;
import com.malnutrition.backend.domain.machine.machinetype.service.MachineTypeService;
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
            return ResponseEntity.ok(machineTypeService.createType(name));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTypes() {
        return ResponseEntity.ok(machineTypeService.getAllTypes());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateType(@PathVariable Long id, @RequestParam String name) {
        try {
            return ResponseEntity.ok(machineTypeService.updateType(id, name));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteType(@PathVariable Long id) {
        try {
            machineTypeService.deleteType(id);
            return ResponseEntity.ok("타입 삭제에 성공했습니다!!");
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
