package com.malnutrition.backend.domain.chatroom.chatroom.controller;

import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageResponseDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomRequestDto;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomResponseDto;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.service.ChatRoomService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chatrooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping
    public ResponseEntity<ChatRoomResponseDto> createChatRoom(@RequestBody ChatRoomRequestDto requestDto) {
        ChatRoomResponseDto response = chatRoomService.createChatRoom(requestDto);
        return ResponseEntity.ok(response);
    }

    // 채팅방 조회 API
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getChatRoom(@PathVariable Long roomId) {
        try {
            ChatRoomResponseDto responseDto = chatRoomService.getChatRoom(roomId);
            return ResponseEntity.ok(responseDto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }

    @GetMapping("/{roomId}/messages")
    public List<ChatMessageResponseDto> getChatMessages(@PathVariable Long roomId) {
        return chatMessageRepository.findByChatRoomIdOrderByCreatedDateAsc(roomId)
                .stream()
                .map(ChatMessageResponseDto::from)
                .collect(Collectors.toList());
    }



}