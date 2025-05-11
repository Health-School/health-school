package com.malnutrition.backend.domain.machine.machinetype.entity;

import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "types")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class MachineType extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;
}
