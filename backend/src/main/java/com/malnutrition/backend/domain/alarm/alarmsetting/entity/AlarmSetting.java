package com.malnutrition.backend.domain.alarm.alarmsetting.entity;

import com.malnutrition.backend.domain.alarm.alarmsetting.enums.AlarmSettingType;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
public class AlarmSetting extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User listener;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlarmSettingType alarmSettingType;

    @Column(nullable = false)
    private boolean isEnabled;
}
