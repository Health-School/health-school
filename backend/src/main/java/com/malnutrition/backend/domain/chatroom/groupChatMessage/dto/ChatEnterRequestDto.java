package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatEnterRequestDto {
    private String writerName;
    // receiverName은 그룹 채팅에선 사용 안할 수도 있음
}
