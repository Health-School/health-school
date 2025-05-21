package com.malnutrition.backend.domain.order.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.enums.TossPaymentMethod;
import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id
    private String id;

    private String name; // lecuture 이름

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_Id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lecture_id",nullable = false)
    private Lecture lecture;

    private String paymentKey;

    @Column(nullable = false)
    private Long amount;

    private Long totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    private TossPaymentMethod tossPaymentMethod;

    @Enumerated(EnumType.STRING)
    private TossPaymentStatus tossPaymentStatus;


    LocalDateTime requestedAt; //결제 요청 시간

    LocalDateTime approvedAt; //결제 승인 시간

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime updatedDate;

}
