package com.malnutrition.backend.domain.lecture.report.repository;

import com.malnutrition.backend.domain.lecture.report.entity.Report;
import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {
    public List<Report> findByLectureId(Long lectureId);

    @Query("SELECT r FROM Report r JOIN FETCH r.lecture")
    List<Report> findAllWithLecture();

    @Query("SELECT r FROM Report r JOIN FETCH r.lecture WHERE r.lecture.id = :lectureId")
    List<Report> findByLectureIdWithLecture(@Param("lectureId") Long lectureId);

    @Query(value = "SELECT r FROM Report r JOIN FETCH r.lecture l",
            countQuery = "SELECT count(r) FROM Report r")
    Page<Report> findAllWithLecture(Pageable pageable);

    @Query(value = "SELECT r FROM Report r JOIN FETCH r.lecture l WHERE r.status = :status",
            countQuery = "SELECT count(r) FROM Report r WHERE r.status = :status")
    Page<Report> findByStatusWithLecture(@Param("status") ReportStatus status, Pageable pageable);

    @Query(value = "SELECT r FROM Report r JOIN FETCH r.lecture l WHERE l.id = :lectureId",
            countQuery = "SELECT count(r) FROM Report r WHERE r.lecture.id = :lectureId")
    Page<Report> findByLectureIdWithLecture(@Param("lectureId") Long lectureId, Pageable pageable);

    @Query("SELECT r FROM Report r JOIN FETCH r.lecture l WHERE r.id = :reportId")
    Optional<Report> findByIdWithLecture(@Param("reportId") Long reportId);

    @Query("SELECT r.reportType AS reportType, COUNT(r.id) AS reportCount " +
            "FROM Report r " +
            "GROUP BY r.reportType")
    List<Object[]> countReportsByType();
}
