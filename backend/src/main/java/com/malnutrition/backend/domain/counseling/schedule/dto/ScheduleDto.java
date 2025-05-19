package com.malnutrition.backend.domain.counseling.schedule.dto;

import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class ScheduleDto {
    private Long id;
    private String userName;
    private String trainerName;
    private LocalDate desiredDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ApprovalStatus approvalStatus;
    private String rejectedReason;

    public static ScheduleDto fromEntity(Schedule schedule) {
        return new ScheduleDto(
                schedule.getId(),
                schedule.getUser().getNickname(),    // 혹은 getName()
                schedule.getTrainer().getNickname(), // 혹은 getName()
                schedule.getDesiredDate(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getApprovalStatus(),
                schedule.getRejectionReason()
        );
    }
}

