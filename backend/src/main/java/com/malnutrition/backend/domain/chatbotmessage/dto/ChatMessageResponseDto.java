package com.malnutrition.backend.domain.chatbotmessage.dto;

import com.malnutrition.backend.domain.chatbotmessage.enums.ChatBotSenderType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Builder
@ToString
public class ChatMessageResponseDto {

    private String message;
    private ChatBotSenderType sender;
    private LocalDateTime createdAt;
    public ChatMessageResponseDto(String message, ChatBotSenderType sender, LocalDateTime createdAt) {
        this.message = message;
        this.sender = sender;
        this.createdAt = createdAt;
    }
}
