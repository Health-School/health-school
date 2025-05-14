package com.malnutrition.backend.domain.chatroom.chatmessage.controller;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.*;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.service.ChatService;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.service.ChatRoomService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@Slf4j
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final ChatRoomService chatRoomService;
    private final ChatRoomRepository chatRoomRepository;
    private final SimpMessagingTemplate messageTemplate;

    @MessageMapping(value = "/chat/room/enter/{roomId}")
    public void enter(
            @DestinationVariable("roomId") Long roomId,
            @Payload ChatEnterRequestDto enterMessage) {

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));

        ChatEnterResponseMessageDto message = ChatEnterResponseMessageDto.builder()
                .roomId(chatRoom.getId())
                .writerName(enterMessage.getWriterName())
                .message(enterMessage.getWriterName() + "님이 채팅방에 참여하였습니다.")
                .receiverName(enterMessage.getReceiverName())
                .build();

        messageTemplate.convertAndSend("/subscribe/enter/room/" + roomId, message);
    }

    @MessageMapping(value = "/chat/room/leave/{roomId}")
    public void leave(
            @DestinationVariable("roomId") Long roomId,
            @Payload ChatLeaveRequestDto leaveMessage) {
        // 퇴장 메시지 처리 및 브로드캐스트
        messageTemplate.convertAndSend(
                "/subscribe/leave/room/" + roomId,
                leaveMessage.getWriterName() + "님이 채팅방을 나갔습니다."
        );
    }

    @MessageMapping("/chat/message/{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessageDto message) {
        messageTemplate.convertAndSend("/subscribe/chat/room/" + roomId, message);
    }





}
