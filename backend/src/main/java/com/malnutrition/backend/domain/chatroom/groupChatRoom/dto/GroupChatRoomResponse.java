package com.malnutrition.backend.domain.chatroom.groupChatRoom.dto;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GroupChatRoomResponse {

    private Long id;
    private String name;
    private String createdBy;

    public static GroupChatRoomResponse from(GroupChatRoom chatRoom) {
        return GroupChatRoomResponse.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .createdBy(chatRoom.getCreatedBy().getNickname())
                .build();
    }
}
