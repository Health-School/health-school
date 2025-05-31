package com.malnutrition.backend.domain.lecture.report.dto;

import com.malnutrition.backend.domain.lecture.report.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponseDto {
    private Long id;
    private String title;
    private String content;
    private String lectureTitle;
    private String reportTypeDescription; // 신고 유형의 한글 설명
    private String reportStatusDescription;
    private LocalDateTime createdDate;
    private String lectureTrainerName;




    public ReportResponseDto(Report report) {
        this.id = report.getId();
        this.title = report.getTitle();
        this.content = report.getContent();
        this.lectureTitle = report.getLecture().getTitle(); // JOIN FETCH 필요!
        this.reportTypeDescription = report.getReportType().getDescription();
    }

    public static ReportResponseDto fromEntity(Report report) {
        return new ReportResponseDto(
                report.getId(),
                report.getTitle(),
                report.getContent(),
                report.getLecture().getTitle(),
                report.getReportType().getDescription(),
                report.getStatus().getDescription(),
                report.getCreatedDate(),
                report.getLecture().getTrainer() != null ? report.getLecture().getTrainer().getNickname() : "정보 없음"
        );
    }
}
