package com.malnutrition.backend.domain.user.exerciseFeedback.controller;

import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import com.malnutrition.backend.domain.user.exerciseFeedback.enums.ExerciseFeedbackCreateDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.service.ExerciseFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
