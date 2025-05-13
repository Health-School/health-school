package com.malnutrition.backend.domain.order.service;

import com.malnutrition.backend.domain.alarm.alarm.dto.AlarmRequestDto;
import com.malnutrition.backend.domain.alarm.alarm.event.AlarmEventHandler;
import com.malnutrition.backend.domain.order.dto.OrderResponse;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final AlarmEventHandler alarmEventHandler;
    private final Rq rq;

    // 사용자의 결제 내역을 조회
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(User user) {
        List<Order> orders = orderRepository.findByUser(user);
        if (orders.isEmpty()) {
            return Collections.emptyList(); // 비어 있는 리스트 반환
        }

        return orders.stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getAmount(),
                        order.getOrderStatus().toString(),
                        order.getTossPaymentMethod().toString(),
                        order.getRequestedAt(),
                        order.getApprovedAt(),
                        order.getLecture().getId(),
                        order.getLecture().getTitle(),
                        order.getLecture().getTrainer().getNickname()
                ))
                .collect(Collectors.toList());
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

    public void orderSuccessEvent(){

        AlarmRequestDto 시스템 = AlarmRequestDto.from(rq.getActor(), "시스템");
        alarmEventHandler.handleAlarmMessageSend(시스템);
    }

}
