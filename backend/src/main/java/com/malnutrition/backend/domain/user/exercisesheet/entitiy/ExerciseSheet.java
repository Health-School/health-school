package com.malnutrition.backend.domain.user.exercisesheet.entitiy;

import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "exercise_sheets")
@SuperBuilder
@NoArgsConstructor
public class ExerciseSheet extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    Integer reps;

    Integer weight;

    Integer set;

}
