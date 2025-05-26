package com.malnutrition.backend.domain.chatroom.chatmessage.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomResponseDto {
    private Long id;
    private String title;
    private String senderName;
    private String receiverName;
}
