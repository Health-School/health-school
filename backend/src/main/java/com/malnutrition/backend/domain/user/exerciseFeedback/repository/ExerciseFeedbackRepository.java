package com.malnutrition.backend.domain.user.exerciseFeedback.repository;

import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseFeedbackRepository extends JpaRepository<ExerciseFeedback, Long> {
    List<ExerciseFeedback> findByExerciseSheetId(Long sheetId);
    List<ExerciseFeedback> findByTrainerId(Long trainerId);
}
