package com.malnutrition.backend.domain.lecture.lecture.repository;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    boolean existsByTitle(String title);
    Optional<Lecture> findByTitle(String title);

    @Query(value = """
    SELECT l FROM Lecture l
    JOIN l.trainer t
    JOIN l.lectureCategory c
    LEFT JOIN l.coverImage img
    WHERE (:category IS NULL OR c.categoryName = :category)
      AND (:lectureLevel IS NULL OR l.lectureLevel = :lectureLevel)
""",
            countQuery = """
    SELECT COUNT(l) FROM Lecture l
    JOIN l.trainer t
    JOIN l.lectureCategory c
    WHERE (:category IS NULL OR c.categoryName = :category)
      AND (:lectureLevel IS NULL OR l.lectureLevel = :lectureLevel)
""")
    Page<Lecture> findAllWithFiltersPaged(
            @Param("category") String category,
            @Param("lectureLevel") LectureLevel lectureLevel,
            Pageable pageable
    );

}
