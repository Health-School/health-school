package com.malnutrition.backend.domain.certification.certification.entity;


import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
public class Certification extends BaseEntity {


    @Column(length = 50, nullable = false, unique = true)
    private String name;


}
