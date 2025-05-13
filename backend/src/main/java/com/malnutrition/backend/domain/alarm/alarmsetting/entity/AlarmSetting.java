package com.malnutrition.backend.domain.alarm.alarmsetting.entity;

import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
public class AlarmSetting extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id")
    private User listener;

    private boolean marketingAlarm;
    private boolean systemAlarm;
    private boolean orderAlarm;
}