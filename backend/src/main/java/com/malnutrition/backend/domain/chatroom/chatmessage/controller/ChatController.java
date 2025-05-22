package com.malnutrition.backend.domain.chatroom.chatmessage.controller;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.*;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.chatmessage.service.ChatService;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.service.ChatRoomService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
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

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatRoomService chatRoomService;
    private final ChatService chatService;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messageTemplate;

    @MessageMapping("/chat/room/enter/{roomId}")
    public void enter(@DestinationVariable Long roomId,
                      @Payload ChatEnterRequestDto enterMessage) {
        chatService.handleEnterMessage(roomId, enterMessage);
    }

    @MessageMapping("/chat/room/leave/{roomId}")
    public void leave(@DestinationVariable Long roomId,
                      @Payload ChatLeaveRequestDto leaveMessage) {
        chatService.handleLeaveMessage(roomId, leaveMessage);
    }

    @MessageMapping("/chat/message/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId,
                            @Payload ChatMessageDto message) {
        chatService.handleChatMessage(roomId, message);
    }
}