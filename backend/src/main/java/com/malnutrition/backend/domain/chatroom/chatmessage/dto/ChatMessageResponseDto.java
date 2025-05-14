package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponseDto {
    private final String writer;
    private final String content;
    private final LocalDateTime createdAt;

    public ChatMessageResponseDto(ChatMessage message) {
        this.writer = message.getSender().getNickname();
        this.content = message.getMessage();
        this.createdAt = message.getCreatedDate();
    }

    public static ChatMessageResponseDto from(ChatMessage message) {
        return new ChatMessageResponseDto(message);
    }
}