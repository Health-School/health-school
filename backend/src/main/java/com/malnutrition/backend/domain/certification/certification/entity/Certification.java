package com.malnutrition.backend.domain.certification.certification.entity;


import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Table(name = "certifications")
public class Certification extends BaseEntity {


    @Column(length = 50, nullable = false, unique = true)
    private String name;



}
