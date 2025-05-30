package com.malnutrition.backend.domain.chatroom.chatroom.controller;

import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageResponseDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
//import com.malnutrition.backend.domain.chatroom.chatmessage.service.ChatService;
import com.malnutrition.backend.domain.chatroom.chatmessage.service.ChatService;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomRequestDto;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomResponseDto;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomSummaryDto;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomUpdateRequestDto;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.service.ChatRoomService;
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
@RequestMapping("/api/v1/chatrooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final Rq rq;
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<?> createChatRoom(@RequestBody ChatRoomRequestDto requestDto) {
        ChatRoomResponseDto response = chatRoomService.createChatRoom(requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "채팅방 생성 성공!"));
    }

    // 채팅방 조회 API
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getChatRoom(@PathVariable Long roomId) {
        try {
            ChatRoomResponseDto responseDto = chatRoomService.getChatRoom(roomId);
            return ResponseEntity.ok(ApiResponse.success(responseDto,"조회 성공!"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("서버 오류가 발생했습니다."));
        }
    }

    @GetMapping("/{roomId}/messages")
    public List<ChatMessageResponseDto> getChatMessages(@PathVariable Long roomId) {
        return chatMessageRepository.findByChatRoomIdOrderByCreatedDateAsc(roomId)
                .stream()
                .map(ChatMessageResponseDto::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{roomId}/access-check")
    public ResponseEntity<?> checkAccess(@PathVariable Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));
        Long userId = rq.getActor().getId();

        boolean hasAccess = chatRoom.getSender().getId().equals(userId)
                || chatRoom.getReceiver().getId().equals(userId);

        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.fail("채팅방 접근 권한이 없습니다."));
        }

        return ResponseEntity.ok().body(ApiResponse.success( null,"접근 허용"));
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<ChatRoomResponseDto> getChatRoomByScheduleId(@PathVariable Long scheduleId) {
        ChatRoomResponseDto response = chatRoomService.getChatRoomByScheduleId(scheduleId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<?> updateChatRoomTitle(
            @PathVariable Long roomId,
            @RequestBody ChatRoomUpdateRequestDto dto) {
        try {
            ChatRoomResponseDto updatedRoom = chatRoomService.updateChatRoomTitle(roomId, dto);
            return ResponseEntity.ok(updatedRoom);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.success(null, "채팅방 제목 수정 권한이 없습니다."));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail( "채팅방 제목 수정 중 오류가 발생했습니다."));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyChatRooms() {
        Long userId = rq.getActor().getId();

        List<ChatRoom> chatRooms = chatRoomRepository.findBySenderIdOrReceiverId(userId, userId);

        List<ChatRoomSummaryDto> response = chatRooms.stream()
                .map(chatRoom -> ChatRoomSummaryDto.from(chatRoom, userId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response,"조회 성공!"));
    }

    @DeleteMapping("/{roomId}/auto-delete")
    public ResponseEntity<?> deleteRoomIfAllLeft(@PathVariable Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));

        chatService.handleLeaveAndMaybeDeleteRoom(chatRoom);

        return ResponseEntity.ok(ApiResponse.success(null,"삭제 조건 확인 및 처리 완료"));
    }



}