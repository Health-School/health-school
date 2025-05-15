package com.malnutrition.backend.domain.order.service;

import com.malnutrition.backend.domain.alarm.alarm.dto.AlarmRequestDto;
import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmType;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.service.LectureService;
import com.malnutrition.backend.domain.order.dto.CreateOrderResponseDto;
import com.malnutrition.backend.domain.order.dto.OrderResponse;
import com.malnutrition.backend.domain.order.dto.CreateAmountRequestDto;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final LectureService lectureService;
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
        AlarmType trainerReply = AlarmType.TRAINER_REPLY;
        String titleMessage = trainerReply.formatMessage("준호", "공지");
        String title = trainerReply.formatTitle();
        AlarmRequestDto 시스템 = AlarmRequestDto.from(rq.getActor(),title, titleMessage,  null);
        applicationEventPublisher.publishEvent(시스템);
    }

    public CreateOrderResponseDto createOrder(CreateAmountRequestDto saveAmountRequest){
        User actor = rq.getActor();
        String orderId = UUID.randomUUID().toString();

        Lecture lectureById = lectureService.findLectureById(saveAmountRequest.getLectureId());

        Order order = Order.builder()
                .id(orderId)
                .user(actor)
                .lecture(lectureById)
                .orderStatus(OrderStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .amount(saveAmountRequest.getAmount())
                .build();

        orderRepository.save(order);
        return CreateOrderResponseDto.builder()
                .orderId(order.getId())
                .amount(order.getAmount())
                .build();

    }

}
