package com.malnutrition.backend.domain.counseling.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class ScheduleUpdateDto {
    private LocalDate desiredDate;  // 원하는 날짜
    private LocalTime startTime;    // 시작 시간
    private LocalTime endTime;      // 종료 시간
}
