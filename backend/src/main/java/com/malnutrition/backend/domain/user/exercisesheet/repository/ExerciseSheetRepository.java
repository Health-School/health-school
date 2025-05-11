package com.malnutrition.backend.domain.user.exercisesheet.repository;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ExerciseSheetRepository extends JpaRepository<ExerciseSheet, Long> {

    Optional<ExerciseSheet> findByIdAndUserId(Long id, Long userId);
}

