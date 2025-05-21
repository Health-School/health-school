package com.malnutrition.backend.domain.order.service;

import com.malnutrition.backend.domain.alarm.alarm.event.AlarmSendEvent;
import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmType;
import com.malnutrition.backend.domain.alarm.alarm.service.AlarmEventService;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.service.LectureService;
import com.malnutrition.backend.domain.lecture.lectureuser.service.LectureUserService;
import com.malnutrition.backend.domain.order.dto.*;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final LectureService lectureService;
    private final LectureUserService lectureUserService;
    private final AlarmEventService alarmEventService;
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
                order.getOrderStatus().getDescription(),
                order.getTossPaymentMethod().toString(),
                order.getRequestedAt(),
                order.getApprovedAt(),
                order.getLecture().getId(),
                order.getLecture().getTitle(),
                order.getLecture().getTrainer().getNickname()
        );
    }



    @Transactional
    public List<OrderResponse> getOrdersByPeriod(String period) {
        LocalDateTime end = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0); // 내일 0시
        LocalDateTime start;
        User user = rq.getActor();

        List<Order> orders = switch (period) {
            case "1개월" -> {
                start = end.minusMonths(1);
                yield orderRepository.findAllByUserAndApprovedAtBetween(user, start, end);
            }
            case "3개월" -> {
                start = end.minusMonths(3);
                yield orderRepository.findAllByUserAndApprovedAtBetween(user, start, end);
            }
            case "6개월" -> {
                start = end.minusMonths(6);
                yield orderRepository.findAllByUserAndApprovedAtBetween(user, start, end);
            }
            case "전체 기간" -> orderRepository.findByUser(user);
            default -> throw new IllegalArgumentException("유효하지 않은 기간입니다: " + period);
        };

        return orders.stream()
                .map(order -> OrderResponse.builder()
                        .id(order.getId())
                        .amount(order.getAmount())
                        .orderStatus(order.getOrderStatus().name())
                        .tossPaymentMethod(order.getTossPaymentMethod().name())
                        .requestAt(order.getRequestedAt())
                        .approvedAt(order.getApprovedAt())
                        .lectureId(order.getLecture().getId())
                        .lectureTitle(order.getLecture().getTitle())
                        .trainerName(order.getLecture().getTrainer().getNickname())
                        .build())
                .toList();
    }

    @Transactional
    public Page<OrderResponse> getOrdersByPeriod(String period, Pageable pageable) {
        LocalDateTime end = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime start;
        User user = rq.getActor();

        Page<Order> orders = switch (period) {
            case "1개월" -> {
                start = end.minusMonths(1);
                yield orderRepository.findAllByUserAndApprovedAtBetween(user, start, end, pageable);
            }
            case "3개월" -> {
                start = end.minusMonths(3);
                yield orderRepository.findAllByUserAndApprovedAtBetween(user, start, end, pageable);
            }
            case "6개월" -> {
                start = end.minusMonths(6);
                yield orderRepository.findAllByUserAndApprovedAtBetween(user, start, end, pageable);
            }
            case "전체 기간" -> orderRepository.findByUser(user, pageable);
            default -> throw new IllegalArgumentException("유효하지 않은 기간입니다: " + period);
        };

        return orders.map(order -> OrderResponse.builder()
                .id(order.getId())
                .amount(order.getAmount())
                .orderStatus(order.getOrderStatus().getDescription())
                .tossPaymentMethod(order.getTossPaymentMethod().name())
                .requestAt(order.getRequestedAt())
                .approvedAt(order.getApprovedAt())
                .lectureId(order.getLecture().getId())
                .lectureTitle(order.getLecture().getTitle())
                .trainerName(order.getLecture().getTrainer().getNickname())
                .build()
        );
    }

    @Transactional
    public CreateOrderResponseDto createOrder(CreateAmountRequestDto saveAmountRequest){
        User actor = rq.getActor();
        String orderId = UUID.randomUUID().toString();

        Lecture lecture = lectureService.findLectureById(saveAmountRequest.getLectureId());
        lectureUserService.registerLectureUser(lecture, actor);
        Order order = Order.builder()
                .id(orderId)
                .user(actor)
                .lecture(lecture)
                .name(lecture.getTitle())
                .orderStatus(OrderStatus.PENDING)
                .amount(saveAmountRequest.getAmount())
                .build();

        orderRepository.save(order);
        return CreateOrderResponseDto.builder()
                .orderId(order.getId())
                .amount(order.getAmount())
                .build();
    }

    @Transactional
    public void confirmOrder(TossPaymentsResponse tossPaymentsResponse){
        String orderId = tossPaymentsResponse.getOrderId();
        Order order = findById(orderId);

        order.setPaymentKey(tossPaymentsResponse.getPaymentKey());
        order.setOrderStatus(OrderStatus.COMPLETED);
        order.setTotalAmount(tossPaymentsResponse.getTotalAmount());
        order.setPaymentKey(tossPaymentsResponse.getPaymentKey());
        order.setTossPaymentMethod(tossPaymentsResponse.getMethod());
        order.setTossPaymentStatus(tossPaymentsResponse.getStatus());
        order.setRequestedAt(tossPaymentsResponse.getRequestedAt().toLocalDateTime());
        order.setApprovedAt(tossPaymentsResponse.getApprovedAt().toLocalDateTime());

        alarmEventService.sendOrderCompleteAlarm();
    }



    @Transactional
    public Order findById(String orderId){
        return orderRepository.findById(orderId).orElseThrow(() ->  new IllegalArgumentException("존재하지 않는 orderId 입니다."));
    }

    public Page<SettlementOrderDto> getTrainerSettlementOrders(User trainer, Pageable pageable) {
        return orderRepository
                .findByLectureTrainerAndTossPaymentStatus(trainer, TossPaymentStatus.DONE, pageable)
                .map(SettlementOrderDto::from);
    }

    public Long getTotal(User trainer) {
        return Optional.ofNullable(orderRepository.getTotalSettlementAmount(trainer)).orElse(0L);
    }

    public Long getMonthly(User trainer, int year, int month) {
        return Optional.ofNullable(orderRepository.getMonthlySettlementAmount(trainer, year, month)).orElse(0L);
    }

    public Long getYearly(User trainer, int year) {
        return Optional.ofNullable(orderRepository.getYearlySettlementAmount(trainer, year)).orElse(0L);
    }



}
