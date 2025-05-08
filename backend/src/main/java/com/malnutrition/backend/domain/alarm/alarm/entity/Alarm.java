package com.malnutrition.backend.domain.alarm.alarm.entity;


import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "alarms")
@SuperBuilder
@NoArgsConstructor
public class Alarm extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User listener;

    private String title;

    private String message;

    private LocalDateTime readAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlarmStatus alarmStatus;

}
