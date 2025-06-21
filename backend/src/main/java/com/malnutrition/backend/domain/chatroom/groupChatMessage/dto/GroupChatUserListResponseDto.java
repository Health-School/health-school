package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupChatUserListResponseDto {
    private Long userId;
    private String nickname;
    private String profileImage;
    @JsonProperty("creator")
    private boolean isCreator;
}