package com.malnutrition.backend.domain.chatroom.groupChatMessage.controller;

import com.malnutrition.backend.domain.chatroom.groupChatMessage.dto.GroupChatMessageResponseDto;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.dto.GroupChatUserListResponseDto;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.repository.GroupChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import com.malnutrition.backend.domain.chatroom.groupChatUser.repository.GroupChatUserRepository;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/group-chat")
@RequiredArgsConstructor
public class GroupChatMessageController {
    private final GroupChatMessageRepository groupChatMessageRepository;
    private final GroupChatUserRepository groupChatUserRepository;
    private final ImageService imageService;
    private final Rq rq;
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<GroupChatMessageResponseDto>> getMessages(@PathVariable Long roomId) {
        List<GroupChatMessage> messages = groupChatMessageRepository.findAllWithSenderByGroupChatRoomId(roomId);

        List<GroupChatMessageResponseDto> result = messages.stream()
                .map(message -> GroupChatMessageResponseDto.fromEntity(message, imageService))  // ✅ imageService 넘기기
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{roomId}/users")
    public ResponseEntity<List<GroupChatUserListResponseDto>> getGroupChatUsers(@PathVariable Long roomId) {
        List<GroupChatUser> users = groupChatUserRepository.findAllByGroupChatRoomId(roomId);

        List<GroupChatUserListResponseDto> participantDtos = users.stream()
                .map(groupChatUser -> GroupChatUserListResponseDto.builder()
                        .userId(groupChatUser.getUser().getId())
                        .nickname(groupChatUser.getUser().getNickname())
                        .profileImage(imageService.getImageUrl(groupChatUser.getUser().getProfileImage()))
                        .isCreator(groupChatUser.getGroupChatRoom().getCreatedBy().getId().equals(groupChatUser.getUser().getId()))// ⚠️ 이 필드가 User 엔티티에 있어야 함
                        .build())
                .toList();

        return ResponseEntity.ok(participantDtos);
    }
}
