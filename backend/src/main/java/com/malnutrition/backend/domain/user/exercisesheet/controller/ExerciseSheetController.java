package com.malnutrition.backend.domain.user.exercisesheet.controller;

import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetCreateDto;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.service.ExerciseSheetService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/exerciseSheets")
public class ExerciseSheetController {
    private final ExerciseSheetService exerciseSheetService;
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

}
