package com.malnutrition.backend.domain.machine.machine.entity;

import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import com.malnutrition.backend.domain.user.exercisesheet.entitiy.ExerciseSheet;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "machines")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Machine extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)  // FK 이름을 명시적으로 지정
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machineType_id",nullable = false)
    private MachineType machineType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exerciseSheet_id",nullable = false)
    private ExerciseSheet exerciseSheet;






}
