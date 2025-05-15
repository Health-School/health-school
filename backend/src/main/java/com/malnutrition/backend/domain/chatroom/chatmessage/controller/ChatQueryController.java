package com.malnutrition.backend.domain.chatroom.chatmessage.controller;

import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageResponseDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageUpdateRequestDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatResponseDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.chatmessage.service.ChatService;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chats")
public class ChatQueryController {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final Rq rq;
    private final ChatService chatService;

    @GetMapping("/room/{roomId}/messages")
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

    @PutMapping("/{messageId}")
    public ResponseEntity<?> updateChatMessage(
            @PathVariable Long messageId,
            @RequestBody ChatMessageUpdateRequestDto dto) {

        Long userId = rq.getActor().getId(); // 로그인한 사용자 ID를 가져옵니다.

        try {
            ChatMessage updatedMessage = chatService.updateChatMessage(messageId, dto, userId);
            return ResponseEntity.ok(ApiResponse.success(updatedMessage, "수정 성공!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteChatMessage(@PathVariable Long messageId) {
        Long userId = rq.getActor().getId(); // 로그인한 사용자 ID

        try {
            chatService.deleteChatMessage(messageId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}
