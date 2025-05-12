package com.malnutrition.backend.domain.counseling.schedule.dto;

import com.malnutrition.backend.domain.counseling.schedule.enums.ApprovalStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleCreateDto {
    private Long trainerId;
    private LocalDate desiredDate;
    private LocalTime startTime;
    private LocalTime endTime;
}

