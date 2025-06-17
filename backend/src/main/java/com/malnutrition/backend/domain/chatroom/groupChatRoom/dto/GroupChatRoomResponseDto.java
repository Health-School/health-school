package com.malnutrition.backend.domain.chatroom.groupChatRoom.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupChatRoomResponseDto {
    private Long id;
    private String name;
    private Long trainerId;
    private String trainerName;
    private Long lectureId;
}
