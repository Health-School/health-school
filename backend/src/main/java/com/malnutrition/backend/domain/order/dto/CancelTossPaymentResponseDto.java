package com.malnutrition.backend.domain.order.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@NoArgsConstructor
@AllArgsConstructor
public class CancelTossPaymentResponseDto {
    // Getter/Setter
    private TossPaymentStatus status;
    private ZonedDateTime requestedAt;
    private ZonedDateTime approvedAt;

}