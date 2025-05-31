package com.malnutrition.backend.domain.order.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.malnutrition.backend.domain.lecture.curriculumProgress.entity.CurriculumProgress;
import com.malnutrition.backend.domain.lecture.curriculumProgress.repository.CurriculumProgressRepository;
import com.malnutrition.backend.domain.lecture.curriculumProgress.service.CurriculumProgressService;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.order.dto.CancelTossPaymentResponseDto;
import com.malnutrition.backend.domain.order.dto.ConfirmPaymentRequestDto;
import com.malnutrition.backend.domain.order.dto.TossPaymentsResponse;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class TossPaymentService {

    private final ObjectMapper objectMapper;
    private final OrderService orderService;
    private final CurriculumProgressRepository curriculumProgressRepository;
    private final LectureUserRepository lectureUserRepository;
    @Value("${tossPayments.secret-key}")
    private  String secretKey;

    private final WebClient webClient = WebClient.builder().
            baseUrl("https://api.tosspayments.com/v1/payments")
            .build();


    public boolean verifyAmount(String orderId, long amount) {
        // Redis에서 결제 금액 조회
        Order order = orderService.findById(orderId);
        try {
            long savedAmount = order.getAmount();

            if (savedAmount != amount) {
                return false;  // 금액이 일치하지 않음
            }
            // 금액이 일치하면 Redis에서 해당 키 삭제
            return true;
        } catch (NumberFormatException e) {
            // 저장된 값이 숫자로 변환 불가한 경우
            return false;
        }
    }

    public ResponseEntity<TossPaymentsResponse> requestPaymentConfirm(ConfirmPaymentRequestDto confirmPaymentRequest) throws IOException, InterruptedException {
        String tossOrderId = confirmPaymentRequest.getOrderId();
        long amount = confirmPaymentRequest.getAmount();
        String tossPaymentKey = confirmPaymentRequest.getPaymentKey();
        log.info("amount: {}",amount);
        // 승인 요청에 사용할 JSON 객체를 만듭니다.
        JsonNode requestObj = objectMapper.createObjectNode()
                .put("paymentKey", tossPaymentKey)
                .put("orderId", tossOrderId)
                .put("amount", amount);

        return webClient.post()
                .uri("/confirm")
                .header("Authorization", getAuthorizations())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestObj)
                .retrieve()
                .toEntity(TossPaymentsResponse.class)
                .block();
    }

    @Transactional
    public CancelTossPaymentResponseDto requestPaymentCancel(String orderId, String cancelReason) throws IOException, InterruptedException {
        ObjectNode body = objectMapper.createObjectNode();
        Order order = orderService.findById(orderId);
        Long lectureId = order.getLecture().getId();
        boolean exists = curriculumProgressRepository.existsByLectureId(lectureId);

        if(exists){
            throw new EntityNotFoundException("강의를 시청한 회원은 환불이 불가능합니다.");
        }
        order.setOrderStatus(OrderStatus.CANCEL);
//        lectureUserRepository.deleteLectureUserByUserIdAndLectureId(order.getUser().getId(), lectureId); // 강의 삭제
        String paymentKey = order.getPaymentKey();
        body.put("cancelReason", cancelReason);
        CancelTossPaymentResponseDto cancelTossPaymentResponseDto = webClient.post()
                .uri("/" + paymentKey + "/cancel")
                .header("Authorization", getAuthorizations())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .toEntity(CancelTossPaymentResponseDto.class)
                .block()
                .getBody();

        order.setTossPaymentStatus(cancelTossPaymentResponseDto.getStatus());
        order.setRequestedAt(cancelTossPaymentResponseDto.getRequestedAt().toLocalDateTime());
        order.setApprovedAt(cancelTossPaymentResponseDto.getApprovedAt().toLocalDateTime());

        return cancelTossPaymentResponseDto;
    }
    private String getAuthorizations(){
        String rawAuthKey = secretKey + ":";
        String encodedKey = Base64.getEncoder().encodeToString(rawAuthKey.getBytes());
        log.info("encodeKey {}", encodedKey);
        return  "Basic " + encodedKey;
    }
}
