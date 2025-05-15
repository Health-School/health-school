package com.malnutrition.backend.domain.chatroom.chatroom.dto;

import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ChatRoomResponseDto {
    private Long id;
    private String title;
    private String senderName;
    private String receiverName;

    public ChatRoomResponseDto(Long id, String title, String senderName, String receiverName) {
        this.id = id;
        this.title = title;
        this.senderName = senderName;
        this.receiverName = receiverName;
    }

    public static ChatRoomResponseDto from(ChatRoom chatRoom) {
        return ChatRoomResponseDto.builder()
                .id(chatRoom.getId())
                .title(chatRoom.getTitle())
                .senderName(chatRoom.getSender().getNickname())
                .receiverName(chatRoom.getReceiver().getNickname())
                .build();
    }

    // Getter/Setter
}