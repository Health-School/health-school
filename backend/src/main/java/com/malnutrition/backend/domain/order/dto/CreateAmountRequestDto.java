package com.malnutrition.backend.domain.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAmountRequestDto {
    Long lectureId;
    Long amount;
}
