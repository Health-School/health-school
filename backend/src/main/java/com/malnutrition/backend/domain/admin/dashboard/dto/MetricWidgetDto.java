package com.malnutrition.backend.domain.admin.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MetricWidgetDto {
    private String metricName;
    private Long currentValue;
    private Double percentageChange;
}
