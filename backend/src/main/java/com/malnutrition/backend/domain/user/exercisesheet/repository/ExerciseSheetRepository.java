package com.malnutrition.backend.domain.user.exercisesheet.repository;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ExerciseSheetRepository extends JpaRepository<ExerciseSheet, Long> {

    Optional<ExerciseSheet> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT es FROM ExerciseSheet es WHERE es.user.id = :userId AND es.exerciseDate = :exerciseDate ORDER BY es.exerciseDate DESC")
    List<ExerciseSheet> findByUserIdAndExerciseDateDesc(@Param("userId") Long userId, @Param("exerciseDate") LocalDate exerciseDate);

}

