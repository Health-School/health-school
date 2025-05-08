package com.malnutrition.backend.domain.user.exercisesheet.entitiy;

import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "exercise_sheets")
@SuperBuilder
@NoArgsConstructor
public class ExerciseSheet extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer reps;

    private Integer weight;

    @Column(name = "sets")
    private Integer sets;

}
