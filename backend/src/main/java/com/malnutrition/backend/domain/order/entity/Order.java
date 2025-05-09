package com.malnutrition.backend.domain.order.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.enums.TossPaymentMethod;
import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "orders")
public class Order {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_Id")
    private User user;

    private String paymentKey;

    @Column(nullable = false)
    private long amount;
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    private TossPaymentMethod tossPaymentMethod;

    @Enumerated(EnumType.STRING)
    private TossPaymentStatus tossPaymentStatus;

    @Column(nullable = false)
    private String tossOrderId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id",nullable = false)
    private Lecture lecture;

    LocalDateTime requestedAt; //결제 요청 시간

    LocalDateTime approvedAt; //결제 승인 시간
}
