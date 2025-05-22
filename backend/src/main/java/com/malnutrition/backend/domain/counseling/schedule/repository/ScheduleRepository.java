package com.malnutrition.backend.domain.counseling.schedule.repository;

import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.enums.ApprovalStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.trainer " +
            "WHERE s.trainer = :trainer")
    List<Schedule> findByTrainer(@Param("trainer") User trainer);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.trainer " +
            "WHERE s.trainer = :trainer AND s.approvalStatus = :approvalStatus")
    List<Schedule> findByTrainerAndApprovalStatus(@Param("trainer") User trainer,
                                                  @Param("approvalStatus") ApprovalStatus approvalStatus);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.trainer " +
            "WHERE s.trainer = :trainer AND s.id = :scheduleId")
    Optional<Schedule> findByTrainerAndId(@Param("trainer") User trainer,
                                          @Param("scheduleId") Long scheduleId);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.user " +
            "WHERE s.user = :user")
    List<Schedule> findByUser(@Param("user") User user);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.user " +
            "WHERE s.approvalStatus = :approvalStatus")
    List<Schedule> findByApprovalStatus(@Param("approvalStatus") ApprovalStatus approvalStatus);

    @Query("SELECT s FROM Schedule s " +
            "LEFT JOIN FETCH s.trainer " +
            "LEFT JOIN FETCH s.user " +
            "WHERE s.id = :scheduleId")
    Optional<Schedule> findById(@Param("scheduleId") Long scheduleId);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.trainer " +
            "WHERE s.trainer.id = :trainerId AND s.desiredDate = :desiredDate")
    List<Schedule> findByTrainerIdAndDesiredDate(@Param("trainerId") Long trainerId,
                                                 @Param("desiredDate") LocalDate desiredDate);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.user " +
            "WHERE s.user.id = :userId AND s.desiredDate = :desiredDate")
    List<Schedule> findByUserIdAndDesiredDate(@Param("userId") Long userId,
                                              @Param("desiredDate") LocalDate desiredDate);

    // Page 객체는 fetch join과 호환되지 않으므로 EntityGraph로 처리하거나 나누는 방식 필요
    // 여기서는 EntityGraph를 예시로 추가
    @EntityGraph(attributePaths = {"user"})
    Page<Schedule> findByUserId(Long userId, Pageable pageable);
}

