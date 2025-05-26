package com.malnutrition.backend.domain.chatroom.chatroom.dto;

import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomSummaryDto {
    private Long roomId;
    private String title;
    private String opponentNickname;

    public static ChatRoomSummaryDto from(ChatRoom chatRoom, Long currentUserId) {
        User opponent = chatRoom.getSender().getId().equals(currentUserId)
                ? chatRoom.getReceiver()
                : chatRoom.getSender();

        return ChatRoomSummaryDto.builder()
                .roomId(chatRoom.getId())
                .title(chatRoom.getTitle())
                .opponentNickname(opponent.getNickname())
                .build();
    }
}
