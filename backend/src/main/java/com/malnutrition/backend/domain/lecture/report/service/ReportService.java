package com.malnutrition.backend.domain.lecture.report.service;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.report.dto.ReportResponseDto;
import com.malnutrition.backend.domain.lecture.report.entity.Report;
import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import com.malnutrition.backend.domain.lecture.report.repository.ReportRepository;
import jakarta.persistence.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final LectureRepository lectureRepository;

    // 신고하기
    @Transactional
    public Report addReport(Long userId ,Long letureId, String title, String content) {
        Lecture lecture = lectureRepository.findById(letureId)
                .orElseThrow(() -> new IllegalArgumentException("없는 강의 입니다."));

        Report report = Report.builder()
                .lecture(lecture)
                .title(title)
                .content(content)
                .status(ReportStatus.PENDING)
                .build();
        return reportRepository.save(report);
    }

    // 신고상태 벼경하기!!!!!
    @Transactional
    public void updateReportStatus(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));

        report.setStatus(status);
    }

    // 전체 신고 조회 (관리자 용도)
    @Transactional(readOnly = true)
    public List<ReportResponseDto> AllReports() {
        return reportRepository.findAllWithLecture().stream()
                .map(ReportResponseDto::new)
                .toList();
    }

    // 어떠한 강의에 대한 신고 조회
    @Transactional(readOnly = true)
    public List<ReportResponseDto> lectureReports(Long lectureId) {
        return reportRepository.findByLectureIdWithLecture(lectureId).stream()
                .map(ReportResponseDto::new)
                .toList();
    }

    // delete
    @Transactional
    public void deleteReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지않는 신고입니다."));
        reportRepository.deleteById(reportId);
    }
}
