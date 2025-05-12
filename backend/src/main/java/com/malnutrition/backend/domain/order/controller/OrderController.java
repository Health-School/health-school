package com.malnutrition.backend.domain.order.controller;

import com.malnutrition.backend.domain.order.dto.OrderResponse;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.service.OrderService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@Slf4j
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
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
}
