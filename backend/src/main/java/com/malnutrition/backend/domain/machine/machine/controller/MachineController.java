package com.malnutrition.backend.domain.machine.machine.controller;

import com.malnutrition.backend.domain.machine.machine.dto.MachineResponseDto;
import com.malnutrition.backend.domain.machine.machine.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
