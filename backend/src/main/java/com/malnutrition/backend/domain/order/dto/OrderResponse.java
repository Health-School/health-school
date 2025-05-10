package com.malnutrition.backend.domain.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private Long amount;
    private String orderStatus;
    private String tossPaymentMethod;
    private LocalDateTime requestAt;
    private LocalDateTime approvedAt;
    private Long lectureId;
    private String lectureTitle;
    private String trainerName;
}
