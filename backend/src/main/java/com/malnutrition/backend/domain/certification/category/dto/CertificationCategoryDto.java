package com.malnutrition.backend.domain.certification.category.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CertificationCategoryDto {
    String name;

    public CertificationCategoryDto(String name) {
        this.name = name;
    }
}
