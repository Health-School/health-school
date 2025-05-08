package com.malnutrition.backend.domain.machine.type.entity;

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
public class Type extends BaseEntity {
    @Column(nullable = false)
    private String name;
}
