package com.malnutrition.backend.domain.order.dto;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class ConfirmPaymentRequestDto {
    String paymentKey;
    String orderId;
    Long amount;
}
