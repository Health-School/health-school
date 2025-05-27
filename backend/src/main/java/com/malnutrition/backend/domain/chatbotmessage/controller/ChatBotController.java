package com.malnutrition.backend.domain.chatbotmessage.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.malnutrition.backend.domain.chatbotmessage.dto.*;
import com.malnutrition.backend.domain.chatbotmessage.enums.ChatBotSenderType;
import com.malnutrition.backend.domain.chatbotmessage.service.ChatBotService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/chatBotMessages")
@Slf4j
@RequiredArgsConstructor
public class ChatBotController {

    private final ChatBotService chatBotService;

    private static final int MAX_RETRIES = 3; // 최대 재요청 횟수
    //chat bot 요청
    @PostMapping("/bot")
    public ResponseEntity<ApiResponse<?>> getChatCompletionContent(@RequestBody ChatBotMessageDto chatBotMessageDto){
        int retries = 0;
        ChatContent chatContent = null;
        while(Objects.isNull(chatContent) && retries < MAX_RETRIES){
            try {
                ChatCompletionResponseDto chatCompletion = chatBotService.getChatCompletion(chatBotMessageDto.getMessage());
                chatContent = chatBotService.getChatContent (chatCompletion);
            }catch (JsonProcessingException e){
                log.error("JSON 처리 중 오류 발생: {}", e.getMessage());
                retries++;
                continue; // 예외가 발생하면 재시도
            }
            retries++;
        }
        log.info("chatContents : {} ", chatContent);
        if(retries >= MAX_RETRIES || chatContent.getMessage() == null ) {
            String errorMessage = String.format("요청 응답을 위해 %d 시도 했지만 실패했습니다.", MAX_RETRIES);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail(errorMessage));
        }
        ChatMessageResponseDto chatMessageResponseDto = chatBotService.saveChatMessage(chatContent.getMessage(), ChatBotSenderType.BOT);

        return ResponseEntity.ok(ApiResponse.success(chatMessageResponseDto, "상담 메시지 생성 성공"));
    }
    // user 메시지
    @PostMapping("/user")
    public ResponseEntity<ApiResponse<ChatMessageResponseDto>> sendUserMessage(@RequestBody ChatUserMessageDto chatUserMessageDto){
        ChatMessageResponseDto chatMessageResponseDto = chatBotService.saveChatMessage(chatUserMessageDto.getMessage(), ChatBotSenderType.USER);
        return ResponseEntity.ok(ApiResponse.success(chatMessageResponseDto, "메시지 저장 성공"));
    }

    //전체 메시지 출력
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatMessageResponseDto>>> getAllMessages() {
        //user id와 관련된 모든 메시지를 가져와라
        List<ChatMessageResponseDto> allChatMessage = chatBotService.getAllChatMessage();
        return ResponseEntity.ok(ApiResponse.success(allChatMessage, "모든 메시지 조회 성공"));
    }

}
