package com.malnutrition.backend.domain.lecture.lecture.repository;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    boolean existsByTitle(String title);
    Optional<Lecture> findByTitle(String title);
}
