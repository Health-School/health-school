package com.malnutrition.backend.domain.counseling.schedule.controller;

import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleCreateDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDecisionDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleUpdateDto;
import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.service.ScheduleService;
import com.malnutrition.backend.global.rp.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/schedules")
@Slf4j
public class ScheduleController {
    private final ScheduleService scheduleService;
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody ScheduleCreateDto dto) {
        log.info("dto {}", dto);
        try {
            ScheduleDto response = scheduleService.createSchedule(dto);
            return ResponseEntity.ok(ApiResponse.success(response, "스케줄 신청 성공!!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @PutMapping("/decision/{scheduleId}")
    public ResponseEntity<?> decideSchedule(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleDecisionDto dto
    ) {
        ScheduleDto result = scheduleService.decideSchedule(scheduleId, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "스케줄 신청 성공!!"));
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleUpdateDto dto) {

        ScheduleDto updatedSchedule = scheduleService.updateSchedule(scheduleId, dto);

        return ResponseEntity.ok(ApiResponse.success(updatedSchedule, "수정 성공!"));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok().body(ApiResponse.success(null,"삭제 성공!"));  // 삭제가 성공적으로 이루어졌을 경우 No Content 반환
    }

    //트레이너 기준 조회 기능
    @GetMapping("/trainer")
    public ResponseEntity<?> getSchedulesByTrainer() {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByTrainer();
        return ResponseEntity.ok(ApiResponse.success(schedules, "조회 성공!"));
    }//전체 조회

    @GetMapping("/trainer/approved")
    public ResponseEntity<?> getApprovedSchedulesByTrainer() {
        List<ScheduleDto> schedules = scheduleService.getApprovedSchedulesByTrainer();
        return ResponseEntity.ok(ApiResponse.success(schedules, "조회 성공!"));
    }//승인된 스케줄만 조회

    @GetMapping("/trainer/{scheduleId}")
    public ResponseEntity<?> getScheduleByTrainerAndId(@PathVariable Long scheduleId) {
        ScheduleDto schedule = scheduleService.getScheduleByTrainerAndId(scheduleId);
        return ResponseEntity.ok(ApiResponse.success(schedule, "조회 성공!"));
    }//스케줄ID 마다의 조회

    //user 기준 조회 기능
    @GetMapping
    public ResponseEntity<?> getSchedulesByUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ScheduleDto> schedules = scheduleService.getSchedulesByUser(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(schedules, "조회 성공!"));
    }

    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedSchedules() {
        List<ScheduleDto> schedules = scheduleService.getApprovedSchedules();
        return ResponseEntity.ok(ApiResponse.success(schedules, "조회 성공!"));
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<?> getScheduleById(@PathVariable Long scheduleId) {
        ScheduleDto schedule = scheduleService.getScheduleById(scheduleId);
        return ResponseEntity.ok(ApiResponse.success(schedule, "조회 성공!"));
    }

    // 트레이너 기준 스케줄 조회
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<?> getSchedulesByTrainerAndDate(
            @PathVariable Long trainerId,
            @RequestParam LocalDate desiredDate) {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByTrainerAndDate(trainerId, desiredDate);

        if (schedules.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.fail("해당 날짜에 스케줄이 없습니다."));
        }
        return ResponseEntity.ok(ApiResponse.success(schedules, "조회 성공!"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSchedulesByUserAndDate(
            @PathVariable Long userId,
            @RequestParam LocalDate desiredDate) {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByUserAndDate(userId, desiredDate);

        if (schedules.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.fail("해당 날짜에 스케줄이 없습니다."));
        }
        return ResponseEntity.ok(ApiResponse.success(schedules, "조회 성공!"));
    }


}
