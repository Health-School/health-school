package com.malnutrition.backend.domain.counseling.schedule.service;

import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleCreateDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDecisionDto;
import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleDto;
import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.enums.ApprovalStatus;
import com.malnutrition.backend.domain.counseling.schedule.repository.ScheduleRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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



}
