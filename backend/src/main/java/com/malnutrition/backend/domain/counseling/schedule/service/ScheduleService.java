package com.malnutrition.backend.domain.counseling.schedule.service;

import com.malnutrition.backend.domain.counseling.schedule.dto.ScheduleCreateDto;
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

}
