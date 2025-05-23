package com.malnutrition.backend.domain.lecture.qnaboard.repository;

import com.malnutrition.backend.domain.lecture.qnaboard.entity.QnaBoard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QnaBoardRepository extends JpaRepository<QnaBoard ,Long> {
    @Query("SELECT q FROM QnaBoard q " +
            "WHERE q.lecture.trainer.id = :trainerId")
    Page<QnaBoard> findAllByTrainerId(@Param("trainerId") Long trainerId, Pageable pageable);
    @Query("SELECT q FROM QnaBoard q WHERE q.lecture.id = :lectureId AND q.lecture.trainer.id = :trainerId")
    Page<QnaBoard> findByLectureIdAndTrainerId(
            @Param("lectureId") Long lectureId,
            @Param("trainerId") Long trainerId,
            Pageable pageable
    );

    Page<QnaBoard> findByLectureId(Long lectureId, Pageable pageable);
}
