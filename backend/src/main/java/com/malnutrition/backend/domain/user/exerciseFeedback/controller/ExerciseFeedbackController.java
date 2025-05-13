package com.malnutrition.backend.domain.user.exerciseFeedback.controller;

import com.malnutrition.backend.domain.user.exerciseFeedback.dto.FeedbackDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import com.malnutrition.backend.domain.user.exerciseFeedback.enums.ExerciseFeedbackCreateDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.service.ExerciseFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/feedbacks")
public class ExerciseFeedbackController {
    private final ExerciseFeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody ExerciseFeedbackCreateDto dto) {
        try {
            ExerciseFeedback saved = feedbackService.createFeedback(dto);
            return ResponseEntity.ok("피드백 작성이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/sheet/{sheetId}")
    public ResponseEntity<?> getBySheetId(@PathVariable Long sheetId) {
        try {
            List<FeedbackDto> list = feedbackService.getFeedbacksBySheetId(sheetId);
            return ResponseEntity.ok(list);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{feedbackId}")
    public ResponseEntity<?> getById(@PathVariable Long feedbackId) {
        try {
            return ResponseEntity.ok(feedbackService.getFeedbackById(feedbackId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<?> getByTrainerId(@PathVariable Long trainerId) {
        try {
            return ResponseEntity.ok(feedbackService.getFeedbacksByTrainerId(trainerId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
