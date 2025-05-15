package com.malnutrition.backend.domain.chatroom.chatmessage.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatRoomResponseDto {
    private Long id;
    private String title;
    private String senderName;
    private String receiverName;
}
