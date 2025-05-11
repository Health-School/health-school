package com.malnutrition.backend.domain.machine.body.entity;


import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "bodies")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Body extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;
}
