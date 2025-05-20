package com.malnutrition.backend.domain.lecture.report.repository;

import com.malnutrition.backend.domain.lecture.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    public List<Report> findByLectureId(Long lectureId);

    @Query("SELECT r FROM Report r JOIN FETCH r.lecture")
    List<Report> findAllWithLecture();

    @Query("SELECT r FROM Report r JOIN FETCH r.lecture WHERE r.lecture.id = :lectureId")
    List<Report> findByLectureIdWithLecture(@Param("lectureId") Long lectureId);
}
