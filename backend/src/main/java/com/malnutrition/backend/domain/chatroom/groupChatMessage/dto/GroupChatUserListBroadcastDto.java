package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GroupChatUserListBroadcastDto {
    private Long roomId;
    private List<GroupChatUserListResponseDto> participants;
}
