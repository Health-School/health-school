package com.malnutrition.backend.domain.user.exercisesheet.entity;

import com.malnutrition.backend.domain.machine.machineExerciseSheet.entity.MachineExerciseSheet;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercise_sheets")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class ExerciseSheet extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "exercise_date", nullable = false)
    private LocalDate exerciseDate;

    @Column(name = "exercise_start_time", nullable = false)
    private LocalTime exerciseStartTime;

    @Column(name = "exercise_end_time", nullable = false)
    private LocalTime exerciseEndTime;

    @OneToMany(mappedBy = "exerciseSheet", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<MachineExerciseSheet> machineExerciseSheets;



}
