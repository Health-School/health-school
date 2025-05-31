package com.malnutrition.backend.domain.order.controller;

import com.malnutrition.backend.domain.lecture.lecture.service.LectureRankingRedisService;
import com.malnutrition.backend.domain.order.dto.CancelOrderRequestDto;
import com.malnutrition.backend.domain.order.dto.CancelTossPaymentResponseDto;
import com.malnutrition.backend.domain.order.dto.ConfirmPaymentRequestDto;
import com.malnutrition.backend.domain.order.dto.TossPaymentsResponse;
import com.malnutrition.backend.domain.order.service.OrderService;
import com.malnutrition.backend.domain.order.service.TossPaymentService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tosspayments")
@Slf4j
public class TossPaymentsController {

    private final TossPaymentService tossPaymentsService;
    private final OrderService orderService;
    private final LectureRankingRedisService lectureRankingRedisService;


    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment (@RequestBody ConfirmPaymentRequestDto confirmPaymentRequestDto) throws IOException, InterruptedException {
        log.info("confirmDto : {}", confirmPaymentRequestDto);
        if(!tossPaymentsService.verifyAmount(confirmPaymentRequestDto.getOrderId(), confirmPaymentRequestDto.getAmount())){
            return ResponseEntity.internalServerError().body("결제 내용 불일치");
        }
        ResponseEntity<TossPaymentsResponse> response = tossPaymentsService.requestPaymentConfirm(confirmPaymentRequestDto);
        if(response.getStatusCode() == HttpStatus.OK){
            try{
                TossPaymentsResponse tossPaymentsResponse = response.getBody();
                log.info("tossPayments body: {}", tossPaymentsResponse);
                Long lectureId = orderService.confirmOrder(tossPaymentsResponse);
                // 🔥 강의 인기 점수 반영
                lectureRankingRedisService.incrementLectureScore(lectureId);
                return ResponseEntity.ok().body(ApiResponse.success(null, "결제 성공"));
            } catch (Exception e){
                //결제 취소... db 에러
                log.error("결제 취소 : ", e.getMessage());
            }
        }
        return ResponseEntity.internalServerError().body("결제 실패");
    }

    @PostMapping("/cancel-order")
    public ResponseEntity<ApiResponse<CancelTossPaymentResponseDto>> cancelOrder (@RequestBody CancelOrderRequestDto cancelOrderRequestDto) throws
            IOException, InterruptedException {
        CancelTossPaymentResponseDto cancelTossPaymentResponseDto = tossPaymentsService.requestPaymentCancel(cancelOrderRequestDto.getOrderId(), cancelOrderRequestDto.getCancelReason());

        return ResponseEntity.ok(ApiResponse.success(cancelTossPaymentResponseDto, "환불 성공"));
    }


}
