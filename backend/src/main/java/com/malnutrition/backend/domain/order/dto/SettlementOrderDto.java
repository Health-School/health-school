package com.malnutrition.backend.domain.order.dto;

import com.malnutrition.backend.domain.order.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SettlementOrderDto {
    private String orderId;
    private String lectureName;
    private String userName;
    private Long amount;
    private LocalDateTime approvedAt;

    public static SettlementOrderDto from(Order order) {
        return new SettlementOrderDto(
                order.getId(),
                order.getLecture().getTitle(),
                order.getUser().getNickname(),
                order.getAmount(),
                order.getApprovedAt()
        );
    }
}
