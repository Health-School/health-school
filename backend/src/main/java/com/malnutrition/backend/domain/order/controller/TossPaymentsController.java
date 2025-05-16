package com.malnutrition.backend.domain.order.controller;

import com.malnutrition.backend.domain.order.dto.ConfirmPaymentRequestDto;
import com.malnutrition.backend.domain.order.dto.TossPaymentsResponse;
import com.malnutrition.backend.domain.order.service.OrderService;
import com.malnutrition.backend.domain.order.service.TossPaymentService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tosspayments")
@Slf4j
public class TossPaymentsController {

    private final TossPaymentService tossPaymentsService;
    private final OrderService orderService;

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
                orderService.confirmOrder(tossPaymentsResponse);
                return ResponseEntity.ok().body(ApiResponse.success(null, "결제 성공"));
            } catch (Exception e){
                //결제 취소... db 에러
            }
        }
        return ResponseEntity.internalServerError().body("결제 실패");
    }

}
