package com.malnutrition.backend.domain.counseling.schedule.repository;

import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.enums.ApprovalStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    // 트레이너 기준 전체 스케줄 조회
    List<Schedule> findByTrainer(User trainer);

    // 트레이너 기준 승인된 스케줄 조회
    List<Schedule> findByTrainerAndApprovalStatus(User trainer, ApprovalStatus approvalStatus);

    // 트레이너 기준 ID별 스케줄 조회
    Optional<Schedule> findByTrainerAndId(User trainer, Long scheduleId);

    // 스케줄 신청한 리스트 조회
    List<Schedule> findByUser(User user);

    // 승인된 스케줄 조회
    List<Schedule> findByApprovalStatus(ApprovalStatus approvalStatus);

    // ID별 스케줄 조회
    Optional<Schedule> findById(Long scheduleId);

    List<Schedule> findByTrainerIdAndDesiredDate(Long trainerId, LocalDate desiredDate);

    List<Schedule> findByUserIdAndDesiredDate(Long userId, LocalDate desiredDate);
}
