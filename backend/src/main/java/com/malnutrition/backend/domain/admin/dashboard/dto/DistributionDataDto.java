package com.malnutrition.backend.domain.admin.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DistributionDataDto {

    private String name;
    private long value;
}
