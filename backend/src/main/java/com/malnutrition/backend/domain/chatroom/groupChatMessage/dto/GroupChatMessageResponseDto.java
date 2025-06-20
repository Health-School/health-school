package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import com.malnutrition.backend.domain.image.service.ImageService;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
public class GroupChatMessageResponseDto {
    private Long messageId;
    private String message;
    private String writerName;
    private UserType userType;
    private LocalDateTime createdDate;
    private String profileImage;


    public static GroupChatMessageResponseDto fromEntity(GroupChatMessage message, ImageService imageService) {
        return GroupChatMessageResponseDto.builder()
                .messageId(message.getId())
                .message(message.getMessage())
                .writerName(message.getSender().getNickname())
                .userType(message.getUserType())
                .createdDate(message.getCreatedDate())
                .profileImage(imageService.getImageUrl(message.getSender().getProfileImage()))
                .build();
    }
}
