package com.malnutrition.backend.domain.counseling.schedule.service;

import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleCreateDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDecisionDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleUpdateDto;
import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.enums.ApprovalStatus;
import com.malnutrition.backend.domain.counseling.schedule.repository.ScheduleRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final Rq rq;

    @Transactional
    public ScheduleDto createSchedule(ScheduleCreateDto dto) {
        User user = rq.getActor(); // 로그인한 사용자

        User trainer = userRepository.findById(dto.getTrainerId())
                .orElseThrow(() -> new IllegalArgumentException("해당 트레이너가 존재하지 않습니다."));

        // 자기 자신에게 상담 신청 금지
        if (user.getId().equals(trainer.getId())) {
            throw new IllegalArgumentException("자기 자신에게 상담을 신청할 수 없습니다.");
        }

        // 트레이너 권한 확인
        if (!trainer.getRole().name().equals("TRAINER")) {
            throw new IllegalArgumentException("상담 신청 대상자는 트레이너여야 합니다.");
        }

        Schedule schedule = Schedule.builder()
                .user(user)
                .trainer(trainer)
                .desiredDate(dto.getDesiredDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .approvalStatus(ApprovalStatus.PENDING)
                .build();

        Schedule saved = scheduleRepository.save(schedule);

        return ScheduleDto.fromEntity(saved);
    }

    @Transactional
    public ScheduleDto decideSchedule(Long scheduleId, ScheduleDecisionDto dto) {
        User trainer = rq.getActor(); // 로그인한 트레이너

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정을 찾을 수 없습니다."));

        // 로그인한 사용자가 해당 일정의 트레이너가 아니면 에러
        if (!schedule.getTrainer().getId().equals(trainer.getId())) {
            throw new SecurityException("해당 일정을 처리할 권한이 없습니다.");
        }

        if (dto.getApproved()) {
            schedule.setApprovalStatus(ApprovalStatus.APPROVED);
            schedule.setRejectionReason(null);
        } else {
            if (dto.getRejectionReason() == null || dto.getRejectionReason().trim().isEmpty()) {
                throw new IllegalArgumentException("거절 사유를 입력해야 합니다.");
            }
            schedule.setApprovalStatus(ApprovalStatus.REJECTED);
            schedule.setRejectionReason(dto.getRejectionReason());
        }

        return ScheduleDto.fromEntity(schedule);
    }

    @Transactional
    public ScheduleDto updateSchedule(Long scheduleId, ScheduleUpdateDto dto) {
        User user = rq.getActor(); // 로그인한 사용자
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 스케줄이 존재하지 않습니다."));

        // 신청자만 수정 가능
        if (!schedule.getUser().getId().equals(user.getId())) {
            throw new SecurityException("자신의 스케줄만 수정할 수 있습니다.");
        }

        // 수정된 값 반영
        schedule.setDesiredDate(dto.getDesiredDate());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());

        // 수정된 스케줄 저장
        Schedule updatedSchedule = scheduleRepository.save(schedule);

        return ScheduleDto.fromEntity(updatedSchedule);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        User user = rq.getActor(); // 로그인한 사용자
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 스케줄이 존재하지 않습니다."));

        // 신청자만 삭제 가능
        if (!schedule.getUser().getId().equals(user.getId())) {
            throw new SecurityException("자신의 스케줄만 삭제할 수 있습니다.");
        }

        // 스케줄 삭제
        scheduleRepository.delete(schedule);
    } //스케줄 취소

    @Transactional(readOnly = true)
    public List<ScheduleDto> getSchedulesByTrainer() {
        User trainer = rq.getActor(); // 로그인한 사용자가 트레이너일 경우 그 사용자

        // 트레이너가 관리하는 모든 스케줄 조회
        List<Schedule> schedules = scheduleRepository.findByTrainer(trainer);

        // 스케줄 리스트를 DTO로 변환하여 반환
        return schedules.stream()
                .map(ScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto> getApprovedSchedulesByTrainer() {
        User trainer = rq.getActor(); // 로그인한 사용자가 트레이너일 경우 그 사용자

        // 트레이너가 관리하는 승인된 스케줄만 조회
        List<Schedule> approvedSchedules = scheduleRepository.findByTrainerAndApprovalStatus(trainer, ApprovalStatus.APPROVED);

        // 승인된 스케줄 리스트를 DTO로 변환하여 반환
        return approvedSchedules.stream()
                .map(ScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleDto getScheduleByTrainerAndId(Long scheduleId) {
        User trainer = rq.getActor(); // 로그인한 사용자가 트레이너일 경우 그 사용자

        // 트레이너가 관리하는 스케줄 중에서 ID가 일치하는 스케줄 조회
        Schedule schedule = scheduleRepository.findByTrainerAndId(trainer, scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 트레이너의 스케줄이 존재하지 않습니다."));

        // 스케줄을 DTO로 변환하여 반환
        return ScheduleDto.fromEntity(schedule);
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto> getSchedulesByUser() {
        User user = rq.getActor(); // 로그인한 사용자

        // 사용자가 신청한 모든 스케줄 조회
        List<Schedule> schedules = scheduleRepository.findByUser(user);

        // 스케줄 리스트를 DTO로 변환하여 반환
        return schedules.stream()
                .map(ScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<ScheduleDto> getSchedulesByUser(Pageable pageable) {
        // 예: 로그인한 사용자 ID를 가져오는 방식 (SecurityContext에서 가져오는 경우)
        Long userId = rq.getActor().getId(); // 예시
        return scheduleRepository.findByUserId(userId, pageable)
                .map(schedule -> ScheduleDto.fromEntity(schedule));
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto> getApprovedSchedules() {
        // 승인된 스케줄 조회
        List<Schedule> approvedSchedules = scheduleRepository.findByApprovalStatus(ApprovalStatus.APPROVED);

        // 승인된 스케줄 리스트를 DTO로 변환하여 반환
        return approvedSchedules.stream()
                .map(ScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleDto getScheduleById(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 스케줄이 존재하지 않습니다."));

        // 스케줄을 DTO로 변환하여 반환
        return ScheduleDto.fromEntity(schedule);
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto> getSchedulesByTrainerAndDate(Long trainerId, LocalDate desiredDate) {
        List<Schedule> schedules = scheduleRepository.findByTrainerIdAndDesiredDate(trainerId, desiredDate);
        return schedules.stream()
                .map(ScheduleDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto> getSchedulesByUserAndDate(Long userId, LocalDate desiredDate) {
        List<Schedule> schedules = scheduleRepository.findByUserIdAndDesiredDate(userId, desiredDate);
        return schedules.stream()
                .map(ScheduleDto::fromEntity)
                .toList();
    }



}
