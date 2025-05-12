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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok().body("삭제 성공!");  // 삭제가 성공적으로 이루어졌을 경우 No Content 반환
    }

    //트레이너 기준 조회 기능
    @GetMapping("/trainer")
    public ResponseEntity<?> getSchedulesByTrainer() {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByTrainer();
        return ResponseEntity.ok(schedules);
    }//전체 조회

    @GetMapping("/trainer/approved")
    public ResponseEntity<?> getApprovedSchedulesByTrainer() {
        List<ScheduleDto> schedules = scheduleService.getApprovedSchedulesByTrainer();
        return ResponseEntity.ok(schedules);
    }//승인된 스케줄만 조회

    @GetMapping("/trainer/{scheduleId}")
    public ResponseEntity<?> getScheduleByTrainerAndId(@PathVariable Long scheduleId) {
        ScheduleDto schedule = scheduleService.getScheduleByTrainerAndId(scheduleId);
        return ResponseEntity.ok(schedule);
    }//스케줄ID 마다의 조회

    //user 기준 조회 기능
    @GetMapping
    public ResponseEntity<?> getSchedulesByUser() {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByUser();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedSchedules() {
        List<ScheduleDto> schedules = scheduleService.getApprovedSchedules();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<?> getScheduleById(@PathVariable Long scheduleId) {
        ScheduleDto schedule = scheduleService.getScheduleById(scheduleId);
        return ResponseEntity.ok(schedule);
    }

    // 트레이너 기준 스케줄 조회
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<?> getSchedulesByTrainerAndDate(
            @PathVariable Long trainerId,
            @RequestParam LocalDate desiredDate) {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByTrainerAndDate(trainerId, desiredDate);

        if (schedules.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "해당 날짜에 스케줄이 없습니다."));
        }
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSchedulesByUserAndDate(
            @PathVariable Long userId,
            @RequestParam LocalDate desiredDate) {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByUserAndDate(userId, desiredDate);

        if (schedules.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "해당 날짜에 스케줄이 없습니다."));
        }
        return ResponseEntity.ok(schedules);
    }


}
