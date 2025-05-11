package com.malnutrition.backend.domain.machine.machineExerciseSheet.entity;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "machineExerciseSheets")
@Getter
@Setter
@AllArgsConstructor
@ToString(exclude = {"exerciseSheet", "machine"})
public class MachineExerciseSheet extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exerciseSheet_id")
    private ExerciseSheet exerciseSheet;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    private Integer reps;

    private Integer weight;

    @Column(name = "sets")
    private Integer sets;
}
