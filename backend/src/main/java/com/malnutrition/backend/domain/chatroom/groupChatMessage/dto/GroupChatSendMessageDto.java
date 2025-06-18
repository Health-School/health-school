package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupChatSendMessageDto {
    private Long roomId;
    private String writerName;
    private String message;
}
