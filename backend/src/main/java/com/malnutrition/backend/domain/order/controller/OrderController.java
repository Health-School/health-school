package com.malnutrition.backend.domain.order.controller;

import com.malnutrition.backend.domain.order.dto.*;
import com.malnutrition.backend.domain.order.service.OrderService;
import com.malnutrition.backend.domain.order.service.TossPaymentService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final TossPaymentService tossPaymentService;
    private final Rq rq;

    // 사용자의 결제 내역을 조회
    @GetMapping("/user")
    public ResponseEntity<?> getOrdersByUser() {
        User user = rq.getActor(); // 사용자를 ID로 조회 (간단한 예시)
        log.info("user {}", user);

        try {
            if (user == null || user.getEmail() == null) {
                log.error("User or user email is null");
                throw new IllegalArgumentException("User or email cannot be null");
            }

            log.info("Fetching orders for user with email: {}", user.getEmail());
            return ResponseEntity.status(200).body(ApiResponse.success(orderService.getOrdersByUser(user), "결제 내역 조회 성공!"));
        } catch (Exception e) {
            log.error("Error occurred while fetching orders for user with email: {}", user.getEmail(), e);
            return ResponseEntity.status(500).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // 결제 내역을 주문 ID로 조회 -> 영수증으로도 이용하기에 충분(정보가 다들어가있음)
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        OrderResponse orderResponse = orderService.getOrderDtoById(orderId);
        if (orderResponse == null) {
            Map<String, String> body = new HashMap<>();
            body.put("message", "해당 결제 내역을 찾을 수 없습니다.");
            return ResponseEntity.ok(ApiResponse.success(body, "해당 결제 내역 조회 실패!"));
        }
        return ResponseEntity.ok(ApiResponse.success(orderResponse, "해당 결제 내역입니다!"));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(
            @RequestParam(defaultValue = "전체 기간", name = "period" ) String period,
            @PageableDefault(size = 10, sort = "approvedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OrderResponse> response = orderService.getOrdersByPeriod(period, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<CreateOrderResponseDto>> createOrder (@RequestBody CreateAmountRequestDto
                                                                                    createAmountRequest){
        CreateOrderResponseDto order = orderService.createOrder(createAmountRequest);

        return ResponseEntity.ok(ApiResponse.success(order, "주문 생성 성공"));
    }



    @PostMapping("/cancel-order")
    public ResponseEntity<ApiResponse<String>> cancelOrder (@RequestBody CancelOrderRequestDto cancelOrderRequestDto) throws
            IOException, InterruptedException {
        String cancelContent = tossPaymentService.requestPaymentCancel(cancelOrderRequestDto.getOrderId(), cancelOrderRequestDto.getCancelReason());

        return ResponseEntity.ok(ApiResponse.success(cancelContent, "환불 성공"));
    }

    @GetMapping("/settlements")
    public ResponseEntity<?> getTrainerSettlementOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User trainer = rq.getActor();

        Pageable pageable = PageRequest.of(page, size, Sort.by("approvedAt").descending());

        Page<SettlementOrderDto> result = orderService.getTrainerSettlementOrders(trainer, pageable);

        return ResponseEntity.ok(ApiResponse.success(result, "정산 내역 조회 성공!"));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSettlementSummary() {
        User trainer = rq.getActor();

        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        Long total = orderService.getTotal(trainer);
        Long monthly = orderService.getMonthly(trainer, currentYear, currentMonth);
        Long yearly = orderService.getYearly(trainer, currentYear);

        Map<String, Long> result = Map.of(
                "monthly", monthly,
                "yearly", yearly,
                "total", total
        );
        return ResponseEntity.ok(ApiResponse.success(result, "정산 요약 조회 성공"));
    }
}
