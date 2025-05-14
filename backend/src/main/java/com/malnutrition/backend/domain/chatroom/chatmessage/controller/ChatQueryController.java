package com.malnutrition.backend.domain.chatroom.chatmessage.controller;

import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageResponseDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatResponseDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ChatQueryController {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    @GetMapping("/api/chat/room/{roomId}/messages")
    public List<ChatResponseDto> getChatMessages(@PathVariable Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));

        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedDateAsc(roomId);

        return messages.stream()
                .map(msg -> ChatResponseDto.builder()
                        .id(msg.getId())
                        .writerName(msg.getSender().getNickname())
                        .message(msg.getMessage())
                        .userType(msg.getUserType())
                        .createdDate(msg.getCreatedDate())
                        .build())
                .collect(Collectors.toList());
    }
}
