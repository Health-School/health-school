package com.malnutrition.backend.domain.admin.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ChartDataDto {
    private String chartName;
    private List<DataPointDto> dataPoints;
}
