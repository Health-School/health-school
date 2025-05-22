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
    public void enter(@DestinationVariable("roomId") Long roomId,
                      @Payload ChatEnterRequestDto enterMessage) {

        ChatRoom chatRoom = chatService.getChatRoomById(roomId);
        User sender = chatService.getUserByNickname(enterMessage.getWriterName());
        chatService.validateUserInChatRoom(chatRoom, sender);

        ChatMessage lastMessage = chatMessageRepository
                .findTopByChatRoomIdAndSenderIdOrderByCreatedDateDesc(roomId, sender.getId())
                .orElse(null);

        if (lastMessage != null && lastMessage.getUserType() != UserType.LEAVE) {
            return;
        }

        String msg = sender.getNickname() + "님이 채팅방에 참여하였습니다.";

        ChatMessage chatMessage = chatService.buildChatMessage(chatRoom, sender, msg, UserType.ENTER);
        chatMessageRepository.save(chatMessage);

        ChatEnterResponseMessageDto response = chatService.buildEnterOrLeaveResponseMessageDto(
                chatRoom,
                sender,
                msg,
                enterMessage.getReceiverName(),
                UserType.ENTER
        );

        messageTemplate.convertAndSend("/subscribe/enter/room/" + roomId, response);
    }


    @MessageMapping("/chat/room/leave/{roomId}")
    public void leave(@DestinationVariable("roomId") Long roomId,
                      @Payload ChatLeaveRequestDto leaveMessage) {

        ChatRoom chatRoom = chatService.getChatRoomById(roomId);
        User sender = chatService.getUserByNickname(leaveMessage.getWriterName());
        chatService.validateUserInChatRoom(chatRoom, sender);

        String msg = sender.getNickname() + "님이 채팅방을 나갔습니다.";

        ChatMessage chatMessage = chatService.buildChatMessage(chatRoom, sender, msg, UserType.LEAVE);
        chatMessageRepository.save(chatMessage);

        ChatEnterResponseMessageDto response = chatService.buildEnterOrLeaveResponseMessageDto(
                chatRoom,
                sender,
                msg,
                leaveMessage.getReceiverName(),
                UserType.LEAVE
        );

        messageTemplate.convertAndSend("/subscribe/leave/room/" + roomId, response);
    }

    @MessageMapping("/chat/message/{roomId}")
    public void sendMessage(@DestinationVariable("roomId") Long roomId,
                            @Payload ChatMessageDto message) {

        ChatRoom chatRoom = chatService.getChatRoomById(roomId);
        User sender = chatService.getUserByNickname(message.getWriterName());
        chatService.validateUserInChatRoom(chatRoom, sender);

        ChatMessage chatMessage = chatService.buildChatMessage(chatRoom, sender, message.getMessage(), UserType.TALK);
        chatMessageRepository.save(chatMessage);

        messageTemplate.convertAndSend("/subscribe/chat/room/" + roomId, message);
    }

}