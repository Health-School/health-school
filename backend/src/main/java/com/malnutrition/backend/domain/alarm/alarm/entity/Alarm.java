package com.malnutrition.backend.domain.alarm.alarm.entity;


import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;


@Entity
@Table(name = "alarms")
@SuperBuilder
@NoArgsConstructor
@Setter
@Getter
public class Alarm extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User listener;

    private String title;

    private String message;

    @Column(nullable = true)
    private String url;

    @Column(nullable = false)
    private Boolean isRead;

}
