package com.malnutrition.backend.domain.admin.report.dto;

import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminReportStatusUpdateRequestDto {

    @NotNull(message = "변경할 신고 상태는 필수입니다.")
    private ReportStatus status;
}
