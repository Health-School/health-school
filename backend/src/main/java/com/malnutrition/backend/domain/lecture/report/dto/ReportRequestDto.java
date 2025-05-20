package com.malnutrition.backend.domain.lecture.report.dto;

import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ReportRequestDto {
    private String title;
    private String content;
    private ReportStatus status;
}
