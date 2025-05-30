package com.malnutrition.backend.domain.user.trainerApplication.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CertificationItemDto {
    private String certificationName;
    private LocalDate acquisitionDate;
    private LocalDate expirationDate;
}
