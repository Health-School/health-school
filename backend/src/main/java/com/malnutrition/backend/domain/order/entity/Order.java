package com.malnutrition.backend.domain.order.entity;

import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.enums.TossPaymentMethod;
import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;
import com.malnutrition.backend.domain.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_Id")
    private User user;

    String paymentKey;
    long amount;
    @Enumerated(EnumType.STRING)
    OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    TossPaymentMethod tossPaymentMethod;

    @Enumerated(EnumType.STRING)
    TossPaymentStatus tossPaymentStatus;

    @Column(nullable = false)
    String tossOrderId;

    LocalDateTime requestedAt; //결제 요청 시간

    LocalDateTime approvedAt; //결제 승인 시간
}
