package com.malnutrition.backend.domain.lecture.curriculumProgress.repository;

import com.malnutrition.backend.domain.lecture.curriculumProgress.entity.CurriculumProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CurriculumProgressRepository extends JpaRepository<CurriculumProgress,Long> {
    Optional<CurriculumProgress> findByUserIdAndCurriculumId(Long userId, Long curriculumId);
}
