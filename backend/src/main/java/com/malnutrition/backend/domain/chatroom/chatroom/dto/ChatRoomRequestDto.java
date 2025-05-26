package com.malnutrition.backend.domain.chatroom.chatroom.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomRequestDto {
    private Long receiverId;
    private String title;
    private Long scheduleId;
}
