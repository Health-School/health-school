package com.malnutrition.backend.domain.user.exercisesheet.repository;

import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseSheetRepository extends JpaRepository<ExerciseSheet, Long> {
}
