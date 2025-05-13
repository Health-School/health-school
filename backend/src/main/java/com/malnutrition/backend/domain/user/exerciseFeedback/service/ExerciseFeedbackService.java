package com.malnutrition.backend.domain.user.exerciseFeedback.service;

import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import com.malnutrition.backend.domain.user.exerciseFeedback.enums.ExerciseFeedbackCreateDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.repository.ExerciseFeedbackRepository;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.repository.ExerciseSheetRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ExerciseFeedbackService {
    private final Rq rq;
    private final ExerciseFeedbackRepository feedbackRepository;
    private final ExerciseSheetRepository exerciseSheetRepository;
    @Transactional
    public ExerciseFeedback createFeedback(ExerciseFeedbackCreateDto dto) {
        User trainer = rq.getActor();
        if (!trainer.getRole().name().equals("TRAINER")) {
            throw new SecurityException("트레이너만 피드백을 작성할 수 있습니다.");
        }

        ExerciseSheet sheet = exerciseSheetRepository.findById(dto.getSheetId())
                .orElseThrow(() -> new IllegalArgumentException("운동 기록지를 찾을 수 없습니다."));

        ExerciseFeedback feedback = ExerciseFeedback.builder()
                .exerciseSheet(sheet)
                .trainer(trainer)
                .comment(dto.getComment())
                .build();

        return feedbackRepository.save(feedback);
    }
}
