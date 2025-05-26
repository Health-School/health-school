package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatEnterResponseMessageDto {
    private Long roomId;
    private String writerName;
    private String message;
    private String receiverName;

    private UserType userType;

}
