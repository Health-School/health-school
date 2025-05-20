package com.malnutrition.backend.domain.admin.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DataPointDto {
    private LocalDate date;
    private Long value;
}
