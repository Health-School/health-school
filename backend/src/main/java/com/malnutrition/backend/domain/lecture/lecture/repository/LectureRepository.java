package com.malnutrition.backend.domain.lecture.lecture.repository;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.lecture.notification.entity.Notification;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, Long> {
    boolean existsByTitle(String title);
    Optional<Lecture> findByTitle(String title);
    Page<Lecture> findAll(Pageable pageable);

    List<Lecture> findByTrainerId(Long trainerId);

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


    long countByCreatedDateBefore(LocalDateTime localDateTime);

    @Query("""
    SELECT l FROM Lecture l
    JOIN FETCH l.trainer t
    LEFT JOIN FETCH t.profileImage
    JOIN FETCH l.lectureCategory
    LEFT JOIN FETCH l.coverImage
    WHERE l.id = :id
""")
    Optional<Lecture> findByIdWithAllDetails(@Param("id") Long id);

    @Query(value = "SELECT l FROM Lecture l " +
                   "LEFT JOIN FETCH l.lectureCategory " +
                   "LEFT JOIN FETCH l.coverImage " +
                   "WHERE l.trainer = :trainer",
            countQuery = "SELECT count(l) FROM Lecture l WHERE l.trainer = :trainer")
    Page<Lecture> findByTrainer(@Param("trainer") User trainer, Pageable pageable);

    /*
    인기 강의 = 가장 많이 구매된 강의
    구매된 강의 수는 lectureId를 기준으로 묶었을 때 가장 많은 count를 갖는 강의
     */



}
