package com.malnutrition.backend.domain.lecture.report.service;

import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmType;
import com.malnutrition.backend.domain.alarm.alarm.event.AlarmSendEvent;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.report.dto.ReportResponseDto;
import com.malnutrition.backend.domain.lecture.report.entity.Report;
import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import com.malnutrition.backend.domain.lecture.report.enums.ReportType;
import com.malnutrition.backend.domain.lecture.report.repository.ReportRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import jakarta.persistence.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final LectureRepository lectureRepository;
    private final ApplicationEventPublisher eventPublisher;

    // 신고하기
    @Transactional
    public Report addReport(Long userId , Long letureId, String title, String content, ReportType reportType) {
        Lecture lecture = lectureRepository.findById(letureId)
                .orElseThrow(() -> new IllegalArgumentException("없는 강의 입니다."));

        Report report = Report.builder()
                .lecture(lecture)
                .title(title)
                .content(content)
                .status(ReportStatus.PENDING)
                .reportType(reportType)
                .build();
        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponseDto> getReports(Pageable pageable, ReportStatus status) {
        Page<Report> reportPage;
        if (status == null) { // 상태 필터 없이 전체 조회
            reportPage = reportRepository.findAllWithLecture(pageable); // findAllWithLecture 메서드가 Pageable을 지원해야 함
        } else { // 특정 상태로 필터링하여 조회
            reportPage = reportRepository.findByStatusWithLecture(status, pageable); // findByStatusWithLecture 메서드가 Pageable을 지원해야 함
        }
        return reportPage.map(ReportResponseDto::fromEntity);
    }


    @Transactional(readOnly = true)
    public ReportResponseDto getReportDetailsById(Long reportId) {

        Report report = reportRepository.findByIdWithLecture(reportId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 신고를 찾을 수 없습니다: " + reportId));

        return ReportResponseDto.fromEntity(report);
    }


    @Transactional(readOnly = true)
    public Page<ReportResponseDto> getReportsByLectureId(Long lectureId, Pageable pageable) {

        if (!lectureRepository.existsById(lectureId)) {
            throw new IllegalArgumentException("존재하지 않는 강의 ID입니다: " + lectureId);
        }
        Page<Report> reportPage = reportRepository.findByLectureIdWithLecture(lectureId, pageable); // findByLectureIdWithLecture 메서드가 Pageable을 지원해야 함
        return reportPage.map(ReportResponseDto::fromEntity);
    }


    // 신고상태 변경하기!!!!!
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

    @Transactional
    public void sendNotificationToTrainerForReport(Long reportId, String adminMessage) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 신고를 찾을 수 없습니다: " + reportId));

        if (report.getStatus() == ReportStatus.REJECTED) {

            return;
        }

        Lecture reportedLecture = report.getLecture();
        User trainer = reportedLecture.getTrainer();

        if (trainer == null) {
            throw new IllegalStateException("해당 강의의 강사 정보를 찾을 수 없습니다. 알림을 발송할 수 없습니다.");
        }

        AlarmType adminNoticeType = AlarmType.ADMIN_NOTICE;
        String title = adminNoticeType.formatTitle(); // "📢 관리자 알림"
        String messageBody = String.format("강의 '%s'(ID:%d)에 대한 신고(ID:%d)와 관련하여 관리자 메시지가 도착했습니다: %s",
                reportedLecture.getTitle(),
                reportedLecture.getId(),
                reportId,
                adminMessage);
        String message = adminNoticeType.formatMessage(messageBody);


        String url = "/lectures/" + reportedLecture.getId();

        AlarmSendEvent alarmSendEvent = AlarmSendEvent.builder()
                .listener(trainer)
                .title(title)
                .message(message)
                .url(url)
                .build();

        eventPublisher.publishEvent(alarmSendEvent);
    }



}
