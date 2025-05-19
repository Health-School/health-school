package com.malnutrition.backend.domain.certification.category.entitiy;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "certification_categories")
public class CertificationCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false, unique = true)
    private String name;

}
