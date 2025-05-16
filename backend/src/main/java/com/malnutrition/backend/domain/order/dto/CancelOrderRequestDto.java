package com.malnutrition.backend.domain.order.dto;

import lombok.Getter;

@Getter
public class CancelOrderRequestDto {

    String orderId;
    String cancelReason;
}
