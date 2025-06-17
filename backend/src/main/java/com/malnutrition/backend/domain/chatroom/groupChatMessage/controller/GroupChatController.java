package com.malnutrition.backend.domain.chatroom.groupChatMessage.controller;

import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatEnterRequestDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatEnterResponseMessageDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.dto.GroupChatEnterRequestDto;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.dto.GroupChatEnterResponseMessageDto;
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
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GroupChatController {
    private final GroupChatRoomRepository groupChatRoomRepository;
    private final UserRepository userRepository;
    private final GroupChatMessageRepository groupChatMessageRepository;
    private final GroupChatUserRepository groupChatUserRepository;
    private final SimpMessagingTemplate messageTemplate;
    @MessageMapping(value = "/chat/group/room/enter/{roomId}")
    @Transactional
    public void enterGroupChatRoom(
            @DestinationVariable("roomId") Long roomId,
            @Payload GroupChatEnterRequestDto enterMessage) {

        GroupChatRoom groupChatRoom = groupChatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("그룹 채팅방이 존재하지 않습니다."));

        User sender = userRepository.findByNickname(enterMessage.getWriterName())
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다."));

        // ✅ 유저가 해당 방에 등록되어 있지 않으면 새로 저장
        boolean isUserAlreadyInRoom = groupChatUserRepository
                .existsByGroupChatRoomIdAndUserId(roomId, sender.getId());

        if (!isUserAlreadyInRoom) {
            GroupChatUser groupChatUser = new GroupChatUser();
            groupChatUser.setGroupChatRoom(groupChatRoom);
            groupChatUser.setUser(sender);
            groupChatUser.setMuted(false);
            groupChatUserRepository.save(groupChatUser);
        }

        // 2. 마지막 메시지가 LEAVE인 경우만 입장 메시지 전송
        GroupChatMessage lastMessage = groupChatMessageRepository
                .findTopByGroupChatRoomIdAndSenderIdOrderByCreatedDateDesc(roomId, sender.getId())
                .orElse(null);

        if (lastMessage != null && lastMessage.getUserType() != UserType.LEAVE) {
            return;
        }

        String msg = sender.getNickname() + "님이 그룹 채팅방에 참여하였습니다.";

        // 3. 메시지 저장
        GroupChatMessage chatMessage = GroupChatMessage.builder()
                .groupChatRoom(groupChatRoom)
                .sender(sender)
                .message(msg)
                .userType(UserType.ENTER)
                .build();
        groupChatMessageRepository.save(chatMessage);

        // 4. 메시지 브로드캐스트
        GroupChatEnterResponseMessageDto message = GroupChatEnterResponseMessageDto.builder()
                .roomId(groupChatRoom.getId())
                .writerName(sender.getNickname())
                .message(msg)
                .userType(UserType.ENTER)
                .build();
        messageTemplate.convertAndSend("/subscribe/group/enter/room/" + roomId, message);
    }
}
