package com.malnutrition.backend.domain.chatroom.groupChatMessage.controller;

import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatEnterRequestDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatEnterResponseMessageDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatLeaveRequestDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.repository.GroupChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.repository.GroupChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import com.malnutrition.backend.domain.chatroom.groupChatUser.repository.GroupChatUserRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GroupChatController {
    private final GroupChatRoomRepository groupChatRoomRepository;
    private final GroupChatUserRepository groupChatUserRepository;
    private final GroupChatMessageRepository groupChatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messageTemplate;

    @MessageMapping("/groupChat/room/enter/{roomId}")
    public void enterGroupChat(
            @DestinationVariable("roomId") Long roomId,
            @Payload ChatEnterRequestDto enterRequest
    ) {
        GroupChatRoom chatRoom = groupChatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));

        User user = userRepository.findByNickname(enterRequest.getWriterName())
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다."));

        boolean alreadyJoined = groupChatUserRepository.existsByGroupChatRoomAndUser(chatRoom, user);

        if (!alreadyJoined) {
            // 입장 정보 저장
            GroupChatUser chatUser = new GroupChatUser();
            chatUser.setGroupChatRoom(chatRoom);
            chatUser.setUser(user);
            chatUser.setMuted(false);
            groupChatUserRepository.save(chatUser);

            // **입장 메시지 저장 (최초 입장 시에만)**
            String msg = user.getNickname() + "님이 채팅방에 참여하였습니다.";

            GroupChatMessage chatMessage = GroupChatMessage.builder()
                    .groupChatRoom(chatRoom)
                    .sender(user)
                    .message(msg)
                    .userType(UserType.ENTER)
                    .build();
            groupChatMessageRepository.save(chatMessage);

            // 메시지 브로드캐스트
            ChatEnterResponseMessageDto responseMessage = ChatEnterResponseMessageDto.builder()
                    .roomId(roomId)
                    .writerName(user.getNickname())
                    .message(msg)
                    .userType(UserType.ENTER)
                    .build();

            messageTemplate.convertAndSend("/subscribe/groupChat/room/" + roomId, responseMessage);
        }
    }




}
