package com.malnutrition.backend.domain.chatroom.chatroom.dto;

import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ChatRoomResponseDto {
    private Long id;
    private String title;
    private String senderName;
    private String receiverName;
    private Long scheduleId;


    public static ChatRoomResponseDto from(ChatRoom chatRoom) {
        return ChatRoomResponseDto.builder()
                .id(chatRoom.getId())
                .title(chatRoom.getTitle())
                .senderName(chatRoom.getSender().getNickname())
                .receiverName(chatRoom.getReceiver().getNickname())
                .scheduleId(chatRoom.getSchedule() != null ? chatRoom.getSchedule().getId() : null)
                .build();
    }

    // Getter/Setter
}