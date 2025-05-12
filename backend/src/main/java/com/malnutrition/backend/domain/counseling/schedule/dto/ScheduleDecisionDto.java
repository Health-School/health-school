package com.malnutrition.backend.domain.counseling.schedule.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDecisionDto {
    private Boolean approved;           // true = 승인, false = 거절
    private String rejectionReason;     // 거절 사유 (거절일 경우 필수)
}
