package com.malnutrition.backend.domain.chatroom.groupChatMessage.controller;

import com.malnutrition.backend.domain.chatroom.groupChatMessage.dto.GroupChatMessageResponseDto;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.repository.GroupChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import com.malnutrition.backend.domain.chatroom.groupChatUser.repository.GroupChatUserRepository;
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
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<GroupChatMessageResponseDto>> getMessages(@PathVariable Long roomId) {
        List<GroupChatMessage> messages = groupChatMessageRepository.findAllWithSenderByGroupChatRoomId(roomId);

        List<GroupChatMessageResponseDto> result = messages.stream()
                .map(GroupChatMessageResponseDto::fromEntity)
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{roomId}/users")
    public ResponseEntity<List<String>> getGroupChatUsers(@PathVariable Long roomId) {
        List<GroupChatUser> users = groupChatUserRepository.findAllByGroupChatRoomId(roomId);
        List<String> nicknames = users.stream()
                .map(groupChatUser -> groupChatUser.getUser().getNickname())
                .toList();
        return ResponseEntity.ok(nicknames);
    }
}
