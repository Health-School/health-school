package com.malnutrition.backend.domain.lecture.curriculum.repository;

import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumDetailDto;
import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    @Query("""
SELECT new com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumDetailDto(
    c.id,
    c.title,
    c.sequence,
    c.content,
    c.s3path,
    cp.totalWatchedSeconds,
    cp.lastWatchedSecond,
    cp.status,
    cp.completedAt,
    cp.lastWatchedAt
)
FROM Curriculum c
LEFT JOIN CurriculumProgress cp
    ON cp.curriculum = c AND cp.user.id = :userId
WHERE c.lecture.id = :lectureId
ORDER BY c.sequence ASC
""")
    List<CurriculumDetailDto> findCurriculumDetailsWithProgressByLectureId(
            @Param("lectureId") Long lectureId,
            @Param("userId") Long userId
    );




    int countByLecture(Lecture lecture);
}
