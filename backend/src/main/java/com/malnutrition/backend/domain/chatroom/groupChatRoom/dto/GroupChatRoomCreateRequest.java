package com.malnutrition.backend.domain.chatroom.groupChatRoom.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GroupChatRoomCreateRequest {
    private Long lectureId;
    private String name;
}
