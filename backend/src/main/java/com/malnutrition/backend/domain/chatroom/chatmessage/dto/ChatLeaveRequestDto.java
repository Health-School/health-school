package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatLeaveRequestDto {
    private String writerName;
    private String receiverName;
}
