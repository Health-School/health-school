package com.malnutrition.backend.domain.lecture.like.repository;

import com.malnutrition.backend.domain.lecture.like.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT AVG(l.score) FROM Like l WHERE l.lectureUser.lecture.id = :lectureId")
    Double findAverageScoreByLectureId(@Param("lectureId") Long lectureId);
}
