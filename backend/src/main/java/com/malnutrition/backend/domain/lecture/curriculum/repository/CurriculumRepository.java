package com.malnutrition.backend.domain.lecture.curriculum.repository;

import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CurriculumRepository extends JpaRepository<Curriculum,Long> {
    @Query("""
    SELECT c
    FROM Curriculum c
    JOIN FETCH c.lecture l
    JOIN FETCH l.trainer
    WHERE c.id = :id
""")
    Optional<Curriculum> findWithLectureAndUserById(@Param("id") Long id);

}
