package com.malnutrition.backend.domain.chatroom.chatroom.dto;

import lombok.Getter;

@Getter
public class ChatRoomRequestDto {
    private Long receiverId;
    private String title;
}
