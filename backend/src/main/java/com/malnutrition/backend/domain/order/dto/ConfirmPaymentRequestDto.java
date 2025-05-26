package com.malnutrition.backend.domain.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentRequestDto {
    String paymentKey;
    String orderId;
    Long amount;
}
