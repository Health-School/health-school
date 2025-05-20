package com.malnutrition.backend.domain.lecture.report.dto;

import com.malnutrition.backend.domain.lecture.report.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponseDto {
    private Long id;
    private String title;
    private String content;
    private String lectureTitle;

    public ReportResponseDto(Report report) {
        this.id = report.getId();
        this.title = report.getTitle();
        this.content = report.getContent();
        this.lectureTitle = report.getLecture().getTitle(); // JOIN FETCH 필요!
    }
}
