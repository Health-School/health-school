package com.malnutrition.backend.domain.user.exercisesheet.entity;

import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "exercise_sheets")
@SuperBuilder
@NoArgsConstructor
public class ExerciseSheet extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "exercise_start_datetime", nullable = false)
    private LocalDateTime exerciseStartDateTime;

    @Column(name = "exercise_end_datetime", nullable = false)
    private LocalDateTime exerciseEndDateTime;

}
