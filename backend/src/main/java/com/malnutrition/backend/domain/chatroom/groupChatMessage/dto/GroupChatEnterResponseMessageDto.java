package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupChatEnterResponseMessageDto {
    private Long roomId;
    private String writerName;
    private String message;
    private UserType userType;
}
