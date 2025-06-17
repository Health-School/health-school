package com.malnutrition.backend.domain.chatroom.groupChatRoom.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GroupChatRoomDetailDto {
    private Long id;
    private String name;
    private String trainerName;
    private Long lectureId;
    private List<String> participants;
}
