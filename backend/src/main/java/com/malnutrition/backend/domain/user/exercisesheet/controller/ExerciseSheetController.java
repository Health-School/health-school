package com.malnutrition.backend.domain.user.exercisesheet.controller;

import com.malnutrition.backend.domain.machine.machineExerciseSheet.service.MachineExerciseSheetService;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetCreateDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetResponseDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.MachineExerciseSheetResponseDto;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.service.ExerciseSheetService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/exerciseSheets")
public class ExerciseSheetController {
    private final ExerciseSheetService exerciseSheetService;
    private final MachineExerciseSheetService machineExerciseSheetService;
    private final Rq rq;
    @PostMapping
    public ResponseEntity<?> createFullExerciseSheet(@RequestBody ExerciseSheetCreateDto dto) {
        try {
            User user = rq.getActor();
            ExerciseSheet created = exerciseSheetService.createFullExerciseSheet(dto, user.getId());
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("운동 기록지를 생성하는 중 예상치 못한 오류가 발생했습니다.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExerciseSheetById(@PathVariable Long id) {
        try {
            User user = rq.getActor();  // 로그인한 사용자 정보
            ExerciseSheet sheet = exerciseSheetService.getExerciseSheetById(id, user.getId());

            if (sheet == null) {
                return ResponseEntity.status(404).body("운동 기록을 찾을 수 없습니다.");
            }

            // ExerciseSheet에서 직접 DTO 변환
            List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                    .map(mes -> new MachineExerciseSheetResponseDto(
                            mes.getMachine().getName(),
                            mes.getReps(),
                            mes.getSets(),
                            mes.getWeight()
                    ))
                    .collect(Collectors.toList());

            ExerciseSheetResponseDto responseDto = new ExerciseSheetResponseDto(
                    sheet.getExerciseDate(),
                    sheet.getExerciseStartTime(),
                    sheet.getExerciseEndTime(),
                    machineDtos
            );

            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("운동 기록 조회 중 오류가 발생했습니다.");
        }
    }





}
