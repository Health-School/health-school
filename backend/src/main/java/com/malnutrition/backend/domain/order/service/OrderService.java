package com.malnutrition.backend.domain.order.service;

import com.malnutrition.backend.domain.order.dto.OrderResponse;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    // 사용자의 결제 내역을 조회
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    // 결제 내역을 주문 ID로 조회
    @Transactional(readOnly = true)
    public OrderResponse getOrderDtoById(String orderId) {
        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isEmpty()) {
            return null;
        }

        Order order = optionalOrder.get();

        // 지연 로딩 처리 완료된 상태에서 DTO로 매핑
        return new OrderResponse(
                order.getId(),
                order.getAmount(),
                order.getOrderStatus().toString(),
                order.getTossPaymentMethod().toString(),
                order.getRequestedAt(),
                order.getApprovedAt(),
                order.getLecture().getId(),
                order.getLecture().getTitle(),
                order.getLecture().getTrainer().getNickname()
        );
    }
}
