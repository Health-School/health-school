package com.malnutrition.backend.domain.lecture.like.repository;

import com.malnutrition.backend.domain.lecture.like.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT AVG(l.score) FROM Like l WHERE l.lectureUser.lecture.id = :lectureId")
    Double findAverageScoreByLectureId(@Param("lectureId") Long lectureId);


    Optional<Like> findByLectureUser_Lecture_IdAndLectureUser_User_Id(Long lectureId, Long userId);

    @Query("SELECT l.lectureUser.lecture.id, AVG(l.score) FROM Like l " +
            "WHERE l.lectureUser.lecture.id IN :lectureIds GROUP BY l.lectureUser.lecture.id")
    List<Object[]> findAverageScoresByLectureIds(@Param("lectureIds") List<Long> lectureIds);

}
