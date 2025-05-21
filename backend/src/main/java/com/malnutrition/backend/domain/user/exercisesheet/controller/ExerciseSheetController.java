package com.malnutrition.backend.domain.user.exercisesheet.controller;

import com.malnutrition.backend.domain.machine.machineExerciseSheet.service.MachineExerciseSheetService;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetCreateDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetRespDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetResponseDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.MachineExerciseSheetResponseDto;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.service.ExerciseSheetService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
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
            return ResponseEntity.ok(ApiResponse.success(created, "운동 기록지 생성 완료!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.fail("운동 기록지를 생성하는 중 예상치 못한 오류가 발생했습니다."));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExerciseSheetById(@PathVariable Long id) {
        try {
            User user = rq.getActor();  // 로그인한 사용자 정보
            ExerciseSheet sheet = exerciseSheetService.getExerciseSheetById(id, user.getId());

            if (sheet == null) {
                return ResponseEntity.status(404).body(ApiResponse.fail("운동 기록을 찾을 수 없습니다."));
            }

            // ExerciseSheet에서 직접 DTO 변환
            List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                    .map(mes -> new MachineExerciseSheetResponseDto(
                            mes.getId(),
                            mes.getExerciseSheet().getUser().getId(),
                            mes.getExerciseSheet().getUser().getNickname(),
                            mes.getMachine().getName(),
                            mes.getReps(),
                            mes.getSets(),
                            mes.getWeight()
                    ))
                    .collect(Collectors.toList());

            ExerciseSheetResponseDto responseDto = new ExerciseSheetResponseDto(
                    sheet.getId(),
                    sheet.getExerciseDate(),
                    sheet.getExerciseStartTime(),
                    sheet.getExerciseEndTime(),
                    machineDtos
            );

            return ResponseEntity.ok(ApiResponse.success(responseDto, "운동 기록 조회 결과입니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.fail("운동 기록 조회 중 오류가 발생했습니다."));
        }
    }
    @GetMapping("/trainer/{id}")
    public ResponseEntity<?> getExerciseSheetByIdFromTrainer(@PathVariable Long id) {
        try {
            // userId 없이 단순히 id로만 조회
            ExerciseSheet sheet = exerciseSheetService.getExerciseSheetById(id);

            if (sheet == null) {
                return ResponseEntity.status(404).body(ApiResponse.fail("운동 기록을 찾을 수 없습니다."));
            }

            // ExerciseSheet에서 직접 DTO 변환
            List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                    .map(mes -> new MachineExerciseSheetResponseDto(
                            mes.getId(),
                            mes.getExerciseSheet().getUser().getId(),
                            mes.getExerciseSheet().getUser().getNickname(),
                            mes.getMachine().getName(),
                            mes.getReps(),
                            mes.getSets(),
                            mes.getWeight()
                    ))
                    .collect(Collectors.toList());

            ExerciseSheetResponseDto responseDto = new ExerciseSheetResponseDto(
                    sheet.getId(),
                    sheet.getExerciseDate(),
                    sheet.getExerciseStartTime(),
                    sheet.getExerciseEndTime(),
                    machineDtos
            );

            return ResponseEntity.ok(ApiResponse.success(responseDto, "운동 기록 조회 결과입니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.fail("운동 기록 조회 중 오류가 발생했습니다."));
        }
    }


    @GetMapping("/date-desc")
    public ResponseEntity<?> getExerciseSheetsByDateDesc(@RequestParam("date") String date) {
        try {
            User user = rq.getActor();  // 로그인한 사용자 정보
            LocalDate exerciseDate = LocalDate.parse(date);

            List<ExerciseSheetResponseDto> response = exerciseSheetService.getExerciseSheetsByUserAndDateDesc(user.getId(), exerciseDate);
            return ResponseEntity.ok(ApiResponse.success(response, "운동 기록 조회 성공!"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.fail("운동 기록 조회 중 오류가 발생했습니다."));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllExerciseSheetsByUser() {
        try {
            User user = rq.getActor();  // 로그인한 사용자 정보
            List<ExerciseSheet> sheets = exerciseSheetService.getAllExerciseSheetsByUser(user.getId());

            // 각 ExerciseSheet -> DTO 변환
            List<ExerciseSheetResponseDto> responseDtos = sheets.stream()
                    .map(sheet -> {
                        List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                                .map(mes -> new MachineExerciseSheetResponseDto(
                                        mes.getId(),
                                        mes.getExerciseSheet().getUser().getId(),
                                        mes.getExerciseSheet().getUser().getNickname(),
                                        mes.getMachine().getName(),
                                        mes.getReps(),
                                        mes.getSets(),
                                        mes.getWeight()
                                )).collect(Collectors.toList());

                        return new ExerciseSheetResponseDto(
                                sheet.getId(),
                                sheet.getExerciseDate(),
                                sheet.getExerciseStartTime(),
                                sheet.getExerciseEndTime(),
                                machineDtos
                        );
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responseDtos, "운동 기록 목록 조회 결과입니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.fail("운동 기록 목록 조회 중 오류가 발생했습니다."));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExerciseSheet(
            @PathVariable Long id,
            @RequestBody ExerciseSheetCreateDto dto
    ) {
        try {
            User user = rq.getActor();
            ExerciseSheetResponseDto updated = exerciseSheetService.updateExerciseSheet(id, dto, user.getId());
            return ResponseEntity.ok(ApiResponse.success(updated, "운동 기록 수정 성공!"));
        } catch (SecurityException se) {
            return ResponseEntity.status(403).body(ApiResponse.fail(se.getMessage()));
        } catch (IllegalArgumentException ie) {
            return ResponseEntity.status(404).body(ApiResponse.fail(ie.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.fail("운동 기록 수정 중 오류가 발생했습니다."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExerciseSheet(@PathVariable Long id) {
        try {
            User user = rq.getActor();  // 로그인한 사용자
            exerciseSheetService.deleteExerciseSheet(id, user.getId());
            return ResponseEntity.ok(ApiResponse.success(null,"운동 기록이 삭제되었습니다."));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.fail("운동 기록 삭제 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/students-exercise-sheets")
    public ResponseEntity<?> getStudentsExerciseSheets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long trainerId = rq.getActor().getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("exerciseDate").descending());
        Page<ExerciseSheetRespDto> result = exerciseSheetService.getAllStudentsExerciseSheets(trainerId, pageable);

        return ResponseEntity.ok(ApiResponse.success(result, "수강생 운동 기록 조회 성공"));
    }






}
