package com.malnutrition.backend.domain.machine.machineExerciseSheet.controller;

import com.malnutrition.backend.domain.machine.machineExerciseSheet.service.MachineExerciseSheetService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/machine-exercises")
public class MachineExerciseSheetController {

    private final MachineExerciseSheetService machineExerciseSheetService;

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMachineExerciseSheet(@PathVariable Long id) {
        try {
            machineExerciseSheetService.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "운동 기록이 삭제되었습니다."));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "운동 기록 삭제 중 오류가 발생했습니다."));
        }
    }
}
