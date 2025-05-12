package com.malnutrition.backend.domain.counseling.schedule.controller;

import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleCreateDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDecisionDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleUpdateDto;
import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {
    private final ScheduleService scheduleService;
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody ScheduleCreateDto dto) {
        try {
            ScheduleDto response = scheduleService.createSchedule(dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/decision/{scheduleId}")
    public ResponseEntity<?> decideSchedule(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleDecisionDto dto
    ) {
        ScheduleDto result = scheduleService.decideSchedule(scheduleId, dto);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleUpdateDto dto) {

        ScheduleDto updatedSchedule = scheduleService.updateSchedule(scheduleId, dto);

        return ResponseEntity.ok(updatedSchedule);
    }

    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.noContent().build();  // 삭제가 성공적으로 이루어졌을 경우 No Content 반환
    }

}
