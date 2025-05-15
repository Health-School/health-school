package com.malnutrition.backend.domain.order.repository;

import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {
    // 사용자 ID로 결제 내역 조회
    List<Order> findByUser(User user);

    // 주문 ID로 결제 내역 조회
    Optional<Order> findById(String orderId);
}
