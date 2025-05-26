package com.malnutrition.backend.domain.lecture.report.dto;

import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDto {
    private String title;
    private String content;
    private ReportStatus status;
}
