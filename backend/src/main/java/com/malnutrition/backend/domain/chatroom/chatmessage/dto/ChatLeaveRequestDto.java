package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatLeaveRequestDto {
    private String writerName;
    private String receiverName;
}
