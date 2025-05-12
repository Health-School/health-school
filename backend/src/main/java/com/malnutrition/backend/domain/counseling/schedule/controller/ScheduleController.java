package com.malnutrition.backend.domain.counseling.schedule.controller;

import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleCreateDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDecisionDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDto;
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
    public ResponseEntity<ScheduleDto> decideSchedule(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleDecisionDto dto
    ) {
        ScheduleDto result = scheduleService.decideSchedule(scheduleId, dto);
        return ResponseEntity.ok(result);
    }

}
