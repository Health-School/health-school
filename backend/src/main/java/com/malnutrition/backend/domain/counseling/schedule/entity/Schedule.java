package com.malnutrition.backend.domain.counseling.schedule.entity;

import com.malnutrition.backend.domain.counseling.schedule.enums.ApprovalStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "counseling_schedules")
@Getter
@Setter
public class Schedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // 상담 신청자

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer; // 상담 받을 트레이너

    @Column(nullable = false)
    private LocalDate desiredDate; // 상담 희망 날짜

    @Column(nullable = false)
    private LocalTime startTime; // 상담 시작 시간

    @Column(nullable = false)
    private LocalTime endTime;   // 상담 종료 시간

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus; // 상담 승인 상태

    @Column(columnDefinition = "TEXT") // 거절 시 사유를 담을 수 있음
    private String rejectionReason;
}
