package com.malnutrition.backend.domain.chatroom.chatmessage.controller;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.*;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
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

    private final ChatRoomRepository chatRoomRepository;


    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messageTemplate;

    @MessageMapping(value = "/chat/room/enter/{roomId}")
    public void enter(
            @DestinationVariable("roomId") Long roomId,
            @Payload ChatEnterRequestDto enterMessage) {

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));
        User sender = userRepository.findByNickname(enterMessage.getWriterName())
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다."));

        if (!chatRoom.getSender().getId().equals(sender.getId()) &&
                !chatRoom.getReceiver().getId().equals(sender.getId())) {
            throw new IllegalArgumentException("이 채팅방에 접근 권한이 없습니다.");
        }

        // 🔍 해당 유저의 최근 메시지 조회 (채팅방 기준)
        ChatMessage lastMessage = chatMessageRepository
                .findTopByChatRoomIdAndSenderIdOrderByCreatedDateDesc(roomId, sender.getId())
                .orElse(null);

        // 🔐 최근 메시지가 LEAVE가 아닌 경우, 재입장 메시지를 보내지 않음
        if (lastMessage != null && lastMessage.getUserType() != UserType.LEAVE) {
            return;
        }

        String msg = enterMessage.getWriterName() + "님이 채팅방에 참여하였습니다.";

        // ✅ DB 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .message(msg)
                .userType(UserType.ENTER)
                .build();
        chatMessageRepository.save(chatMessage);

        // ✅ 메시지 브로드캐스트
        ChatEnterResponseMessageDto message = ChatEnterResponseMessageDto.builder()
                .roomId(chatRoom.getId())
                .writerName(enterMessage.getWriterName())
                .message(msg)
                .userType(UserType.ENTER)
                .receiverName(enterMessage.getReceiverName())
                .build();
        messageTemplate.convertAndSend("/subscribe/enter/room/" + roomId, message);
    }


    @MessageMapping(value = "/chat/room/leave/{roomId}")
    public void leave(
            @DestinationVariable("roomId") Long roomId,
            @Payload ChatLeaveRequestDto leaveMessage) {

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));
        User sender = userRepository.findByNickname(leaveMessage.getWriterName())
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다."));

        if (!chatRoom.getSender().getId().equals(sender.getId()) &&
                !chatRoom.getReceiver().getId().equals(sender.getId())) {
            throw new IllegalArgumentException("이 채팅방에 접근 권한이 없습니다.");
        }

        String msg = leaveMessage.getWriterName() + "님이 채팅방을 나갔습니다.";

        // DB 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .message(msg)
                .userType(UserType.LEAVE)
                .build();
        chatMessageRepository.save(chatMessage);

        // 메시지 브로드캐스트
        messageTemplate.convertAndSend("/subscribe/leave/room/" + roomId, msg);

    }

    @MessageMapping("/chat/message/{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessageDto message) {

        User sender = userRepository.findByNickname(message.getWriterName())
                .orElseThrow(() -> new IllegalArgumentException("보낸 사람을 찾을 수 없습니다."));
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        // DB 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .sender(sender)
                .chatRoom(chatRoom)
                .message(message.getMessage())
                .userType(UserType.TALK)
                .build();

        chatMessageRepository.save(chatMessage);

        // 메시지 브로드캐스트
        messageTemplate.convertAndSend("/subscribe/chat/room/" + roomId, message);
    }



}