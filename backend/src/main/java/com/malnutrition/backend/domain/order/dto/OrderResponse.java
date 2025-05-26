package com.malnutrition.backend.domain.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
