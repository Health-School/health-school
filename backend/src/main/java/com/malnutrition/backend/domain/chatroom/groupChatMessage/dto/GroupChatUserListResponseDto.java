package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupChatUserListResponseDto {
    private Long userId;
    private String nickname;
}