package com.malnutrition.backend.domain.chatroom.chatroom.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomResponseDto {
    private Long id;
    private String title;
    private String senderName;
    private String receiverName;

    public ChatRoomResponseDto(Long id, String title, String senderName, String receiverName) {
        this.id = id;
        this.title = title;
        this.senderName = senderName;
        this.receiverName = receiverName;
    }

    // Getter/Setter
}