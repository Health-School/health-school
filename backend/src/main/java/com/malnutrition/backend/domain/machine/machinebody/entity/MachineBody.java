package com.malnutrition.backend.domain.machine.machinebody.entity;

import com.malnutrition.backend.domain.machine.body.entity.Body;
import com.malnutrition.backend.domain.machine.machine.entity.Machine;

import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "machineBodies")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class MachineBody extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id",nullable = false)  // FK 이름을 명시적으로 지정
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_id",nullable = false)  // FK 이름을 명시적으로 지정
    private Body body;
}
