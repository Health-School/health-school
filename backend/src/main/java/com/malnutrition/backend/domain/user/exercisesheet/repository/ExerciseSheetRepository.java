package com.malnutrition.backend.domain.user.exercisesheet.repository;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ExerciseSheetRepository extends JpaRepository<ExerciseSheet, Long> {

    @Query("SELECT DISTINCT es FROM ExerciseSheet es " +
            "JOIN FETCH es.user " +
            "LEFT JOIN FETCH es.machineExerciseSheets mes " +
            "LEFT JOIN FETCH mes.machine " +
            "WHERE es.id = :id AND es.user.id = :userId")
    Optional<ExerciseSheet> findByIdAndUserId(@Param("id") Long id,
                                              @Param("userId") Long userId);

    @Query("SELECT es FROM ExerciseSheet es " +
            "JOIN FETCH es.user " +
            "WHERE es.user.id = :userId AND es.exerciseDate = :exerciseDate " +
            "ORDER BY es.exerciseDate DESC")
    List<ExerciseSheet> findByUserIdAndExerciseDateDesc(@Param("userId") Long userId,
                                                        @Param("exerciseDate") LocalDate exerciseDate);

    @Query("SELECT es FROM ExerciseSheet es " +
            "JOIN FETCH es.user " +
            "WHERE es.user.id = :userId " +
            "ORDER BY es.exerciseDate DESC")
    List<ExerciseSheet> findAllByUserIdOrderByExerciseDateDesc(@Param("userId") Long userId);

    // Page는 fetch join과 충돌 위험 → EntityGraph 방식 사용
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT e FROM ExerciseSheet e WHERE e.user.id IN :userIds")
    Page<ExerciseSheet> findByUserIds(@Param("userIds") List<Long> userIds, Pageable pageable);
}


