package com.malnutrition.backend.domain.lecture.lectureCategory.repository;

import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LectureCategoryRepository extends JpaRepository<LectureCategory, Long> {
    Optional<LectureCategory> findByName(String name);
}
