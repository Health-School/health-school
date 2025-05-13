package com.malnutrition.backend.domain.user.exerciseFeedback.service;

import com.malnutrition.backend.domain.user.exerciseFeedback.dto.FeedbackUpdateDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import com.malnutrition.backend.domain.user.exerciseFeedback.dto.ExerciseFeedbackCreateDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.dto.FeedbackDto;
import com.malnutrition.backend.domain.user.exerciseFeedback.repository.ExerciseFeedbackRepository;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.repository.ExerciseSheetRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.NoSuchElementException;

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

    @Transactional(readOnly = true)
    public List<FeedbackDto> getFeedbacksBySheetId(Long sheetId) {
        User currentUser = rq.getActor();

        ExerciseSheet sheet = exerciseSheetRepository.findById(sheetId)
                .orElseThrow(() -> new NoSuchElementException("운동 시트지를 찾을 수 없습니다."));

        // 작성자이거나 해당 운동시트의 사용자만 접근 허용
        List<ExerciseFeedback> feedbacks = feedbackRepository.findByExerciseSheetId(sheetId);

        if (feedbacks.isEmpty()) {
            return List.of(); // 빈 리스트 반환
        }

        boolean isSheetOwner = sheet.getUser().getId().equals(currentUser.getId());
        boolean isTrainerWriter = feedbacks.stream()
                .anyMatch(f -> f.getTrainer().getId().equals(currentUser.getId()));
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isSheetOwner && !isTrainerWriter && !isAdmin) {
            throw new SecurityException("운동 시트지의 피드백을 조회할 권한이 없습니다.");
        }

        return feedbacks.stream()
                .map(FeedbackDto::fromEntity)
                .toList();
    }


    @Transactional(readOnly = true)
    public FeedbackDto getFeedbackById(Long feedbackId) {
        User currentUser = rq.getActor();

        ExerciseFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("해당 피드백이 존재하지 않습니다."));

        boolean isSheetOwner = feedback.getExerciseSheet().getUser().getId().equals(currentUser.getId());
        boolean isTrainerWriter = feedback.getTrainer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isSheetOwner && !isTrainerWriter && !isAdmin) {
            throw new SecurityException("해당 피드백을 조회할 권한이 없습니다.");
        }

        return FeedbackDto.fromEntity(feedback);
    }


    @Transactional(readOnly = true)
    public List<FeedbackDto> getFeedbacksByTrainerId(Long trainerId) {
        User currentUser = rq.getActor();
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!currentUser.getId().equals(trainerId) && !isAdmin) {
            throw new SecurityException("해당 트레이너의 피드백을 조회할 권한이 없습니다.");
        }



        return feedbackRepository.findByTrainerId(trainerId).stream()
                .map(FeedbackDto::fromEntity)
                .toList();
    }
    @Transactional
    public FeedbackDto updateFeedback(Long feedbackId, FeedbackUpdateDto dto) {
        User currentUser = rq.getActor();

        ExerciseFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new NoSuchElementException("해당 피드백이 존재하지 않습니다."));

        boolean isTrainer = feedback.getTrainer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isTrainer && !isAdmin) {
            throw new SecurityException("해당 피드백을 수정할 권한이 없습니다.");
        }

        feedback.setComment(dto.getContent());

        return FeedbackDto.fromEntity(feedback);
    }




}
