package com.malnutrition.backend.domain.admin.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TrainerSettlementDto {
    private Long totalSettlement;
    private Long currentMonthSettlement;
    private Long currentYearSettlement;

}
