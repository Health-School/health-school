package com.malnutrition.backend.domain.order.dto;

import lombok.Getter;

@Getter
public class CreateAmountRequestDto {
    Long lectureId;
    Long amount;
}
