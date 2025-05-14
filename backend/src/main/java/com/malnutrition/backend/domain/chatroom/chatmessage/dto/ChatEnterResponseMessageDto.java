package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatEnterResponseMessageDto {
    private Long roomId;
    private String writerName;
    private String message;
    private String receiverName;

}
