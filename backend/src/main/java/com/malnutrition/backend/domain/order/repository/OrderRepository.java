package com.malnutrition.backend.domain.order.repository;

import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {
    // 사용자 ID로 결제 내역 조회
    List<Order> findByUser(User user);

    // 주문 ID로 결제 내역 조회
    Optional<Order> findById(String orderId);

    // 기간 조건 (1개월, 3개월, 6개월)
    List<Order> findAllByUserAndApprovedAtBetween(User user, LocalDateTime from, LocalDateTime to);

    Page<Order> findAllByUserAndApprovedAtBetween(User user, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Order> findByUser(User user, Pageable pageable);

    long countByOrderStatusAndApprovedAtBetween(OrderStatus orderStatus, LocalDateTime startTime, LocalDateTime endTime);

    List<Order> findAllByOrderStatusAndApprovedAtBetween(
            OrderStatus orderStatus,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
}
