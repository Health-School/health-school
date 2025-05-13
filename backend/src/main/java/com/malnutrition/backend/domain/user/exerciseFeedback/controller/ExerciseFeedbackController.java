package com.malnutrition.backend.domain.user.exerciseFeedback.controller;

import com.malnutrition.backend.domain.user.exerciseFeedback.dto.FeedbackDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.dto.FeedbackUpdateDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import com.malnutrition.backend.domain.user.exerciseFeedback.dto.ExerciseFeedbackCreateDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.service.ExerciseFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

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

    @PutMapping("/{feedbackId}")
    public ResponseEntity<?> updateFeedback(@PathVariable Long feedbackId,
                                            @RequestBody FeedbackUpdateDto dto) {
        try {
            FeedbackDto updated = feedbackService.updateFeedback(feedbackId, dto);
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("피드백 수정 중 오류가 발생했습니다.");
        }
    }

    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long feedbackId) {
        try {
            feedbackService.deleteFeedback(feedbackId);
            return ResponseEntity.ok("피드백이 삭제되었습니다.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("피드백 삭제 중 오류가 발생했습니다.");
        }
    }


}
