package com.malnutrition.backend.domain.user.exerciseFeedback.repository;

import com.malnutrition.backend.domain.user.exerciseFeedback.entity.ExerciseFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseFeedbackRepository extends JpaRepository<ExerciseFeedback, Long> {
}
