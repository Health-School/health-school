package com.malnutrition.backend.domain.certification.certification.entity;


import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
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


    @ManyToOne
    @JoinColumn(name = "certification_category_id", nullable = false)
    private CertificationCategory certificationCategory;

    @Column(nullable = false)
    private String issuingInstitution; // 발급 기관


}
