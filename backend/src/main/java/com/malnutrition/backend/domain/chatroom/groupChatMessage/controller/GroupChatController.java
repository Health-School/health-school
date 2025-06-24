package com.malnutrition.backend.domain.chatroom.groupChatMessage.controller;

import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.dto.*;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import com.malnutrition.backend.domain.chatroom.groupChatMessage.repository.GroupChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.repository.GroupChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import com.malnutrition.backend.domain.chatroom.groupChatUser.repository.GroupChatUserRepository;
import com.malnutrition.backend.domain.image.service.ImageService;
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

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GroupChatController {
    private final GroupChatRoomRepository groupChatRoomRepository;
    private final UserRepository userRepository;
    private final GroupChatMessageRepository groupChatMessageRepository;
    private final GroupChatUserRepository groupChatUserRepository;
    private final SimpMessagingTemplate messageTemplate;
    private final ImageService imageService;

    @MessageMapping(value = "/chat/group/room/enter/{roomId}")
    @Transactional
    public void enterGroupChatRoom(
            @DestinationVariable("roomId") Long roomId,
            @Payload GroupChatEnterRequestDto enterMessage) {

        GroupChatRoom groupChatRoom = groupChatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("그룹 채팅방이 존재하지 않습니다."));

        User sender = userRepository.findByNickname(enterMessage.getWriterName())
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다."));

        // ✅ 1. 유저가 그룹에 등록되어 있지 않으면 저장
        boolean isUserAlreadyInRoom = groupChatUserRepository
                .existsByGroupChatRoomIdAndUserId(roomId, sender.getId());

        if (!isUserAlreadyInRoom) {
            GroupChatUser groupChatUser = new GroupChatUser();
            groupChatUser.setGroupChatRoom(groupChatRoom);
            groupChatUser.setUser(sender);
            groupChatUser.setMuted(false);
            groupChatUserRepository.save(groupChatUser);
        }

        // ✅ 2. 마지막 메시지가 LEAVE가 아니면 입장 메시지 전송하지 않음
        GroupChatMessage lastMessage = groupChatMessageRepository
                .findTopByGroupChatRoomIdAndSenderIdOrderByCreatedDateDesc(roomId, sender.getId())
                .orElse(null);

        if (lastMessage != null && lastMessage.getUserType() != UserType.LEAVE) {
            return;
        }

        String msg = sender.getNickname() + "님이 그룹 채팅방에 참여하였습니다.";

        // ✅ 3. 입장 메시지 저장
        GroupChatMessage chatMessage = GroupChatMessage.builder()
                .groupChatRoom(groupChatRoom)
                .sender(sender)
                .message(msg)
                .userType(UserType.ENTER)
                .build();
        groupChatMessageRepository.save(chatMessage);

        // ✅ 4. 입장 메시지 브로드캐스트
        GroupChatEnterResponseMessageDto message = GroupChatEnterResponseMessageDto.builder()
                .roomId(groupChatRoom.getId())
                .writerName(sender.getNickname())
                .message(msg)
                .userType(UserType.ENTER)
                .build();
        messageTemplate.convertAndSend("/subscribe/group/enter/room/" + roomId, message);

        // ✅ 5. 전체 참여자 목록 브로드캐스트
        List<GroupChatUserListResponseDto> participants = groupChatUserRepository
                .findAllByGroupChatRoomId(roomId)
                .stream()
                .map(user -> GroupChatUserListResponseDto.builder()
                        .userId(user.getUser().getId())
                        .nickname(user.getUser().getNickname())
                        .build())
                .toList();

        GroupChatUserListBroadcastDto participantListMessage = GroupChatUserListBroadcastDto.builder()
                .roomId(roomId)
                .participants(participants)
                .build();

        messageTemplate.convertAndSend("/subscribe/group/users/room/" + roomId, participantListMessage);
    }

    @MessageMapping(value = "/chat/group/room/message/{roomId}")
    @Transactional
    public void sendGroupChatMessage(
            @DestinationVariable("roomId") Long roomId,
            @Payload GroupChatSendMessageDto sendMessageDto) {

        GroupChatRoom groupChatRoom = groupChatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("그룹 채팅방이 존재하지 않습니다."));

        User sender = userRepository.findByNickname(sendMessageDto.getWriterName())
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다."));

        // ✅ 1. 메시지 저장
        GroupChatMessage chatMessage = GroupChatMessage.builder()
                .groupChatRoom(groupChatRoom)
                .sender(sender)
                .message(sendMessageDto.getMessage())
                .userType(UserType.TALK) // 일반 메시지
                .build();
        groupChatMessageRepository.save(chatMessage);

        // ✅ 2. 메시지 브로드캐스트
        GroupChatBroadcastMessageDto broadcastMessage = GroupChatBroadcastMessageDto.builder()
                .roomId(roomId)
                .writerName(sender.getNickname())
                .message(sendMessageDto.getMessage())
                .userType(UserType.TALK)
                .profileImage(imageService.getImageUrl(sender.getProfileImage()))
                .build();

        messageTemplate.convertAndSend("/subscribe/group/message/room/" + roomId, broadcastMessage);
    }

    @MessageMapping("/chat/group/room/leave/{roomId}")
    @Transactional
    public void leaveGroupChatRoom(
            @DestinationVariable("roomId") Long roomId,
            @Payload GroupChatEnterRequestDto leaveMessage) {

        GroupChatRoom groupChatRoom = groupChatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("그룹 채팅방이 존재하지 않습니다."));

        User sender = userRepository.findByNickname(leaveMessage.getWriterName())
                .orElseThrow(() -> new EntityNotFoundException("유저가 존재하지 않습니다."));

        // ✅ 퇴장 메시지 저장
        String msg = sender.getNickname() + "님이 그룹 채팅방에서 퇴장하였습니다.";
        GroupChatMessage chatMessage = GroupChatMessage.builder()
                .groupChatRoom(groupChatRoom)
                .sender(sender)
                .message(msg)
                .userType(UserType.LEAVE)
                .build();
        groupChatMessageRepository.save(chatMessage);

        // ✅ 퇴장 메시지 브로드캐스트
        GroupChatEnterResponseMessageDto message = GroupChatEnterResponseMessageDto.builder()
                .roomId(groupChatRoom.getId())
                .writerName(sender.getNickname())
                .message(msg)
                .userType(UserType.LEAVE)
                .build();
        messageTemplate.convertAndSend("/subscribe/group/enter/room/" + roomId, message);

        // ✅ 참여자 목록에서 제거 (원한다면)
        groupChatUserRepository.deleteByGroupChatRoomIdAndUserId(roomId, sender.getId());

        // ✅ 새로운 참여자 목록 브로드캐스트
        List<GroupChatUserListResponseDto> participants = groupChatUserRepository
                .findAllByGroupChatRoomId(roomId)
                .stream()
                .map(user -> GroupChatUserListResponseDto.builder()
                        .userId(user.getUser().getId())
                        .nickname(user.getUser().getNickname())
                        .profileImage(imageService.getImageUrl(user.getUser().getProfileImage()))
                        .build())
                .toList();

        GroupChatUserListBroadcastDto participantListMessage = GroupChatUserListBroadcastDto.builder()
                .roomId(roomId)
                .participants(participants)
                .build();

        messageTemplate.convertAndSend("/subscribe/group/users/room/" + roomId, participantListMessage);
    }

    @MessageMapping("/chat/group/room/force-leave/{roomId}")
    @Transactional
    public void forceLeaveUserFromGroupChat(
            @DestinationVariable("roomId") Long roomId,
            @Payload GroupChatForceLeaveRequestDto requestDto) {

        GroupChatRoom chatRoom = groupChatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));

        User requester = userRepository.findByNickname(requestDto.getRequesterNickname())
                .orElseThrow(() -> new EntityNotFoundException("요청자를 찾을 수 없습니다."));

        // ✅ 관리자인지 확인 (예: 방 개설자가 관리자)
        if (!chatRoom.getCreatedBy().getNickname().equals(requester.getNickname())) {
            throw new IllegalStateException("해당 유저는 관리자 권한이 없습니다.");
        }

        // ✅ 대상 유저 조회
        User target = userRepository.findByNickname(requestDto.getTargetNickname())
                .orElseThrow(() -> new EntityNotFoundException("강퇴 대상 유저를 찾을 수 없습니다."));

        // ✅ 메시지 저장 (FORCE_LEAVE)
        String msg = target.getNickname() + "님이 강제 퇴장당했습니다.";

        GroupChatMessage forceLeaveMessage = GroupChatMessage.builder()
                .groupChatRoom(chatRoom)
                .sender(target)
                .message(msg)
                .userType(UserType.FORCE_LEAVE)
                .build();
        groupChatMessageRepository.save(forceLeaveMessage);

        // ✅ 참여자 목록에서 제거
        groupChatUserRepository.deleteByGroupChatRoomIdAndUserId(roomId, target.getId());

        // ✅ 강퇴 메시지 브로드캐스트
        GroupChatEnterResponseMessageDto leaveNotice = GroupChatEnterResponseMessageDto.builder()
                .roomId(roomId)
                .writerName(target.getNickname())
                .message(msg)
                .userType(UserType.FORCE_LEAVE)
                .build();

        messageTemplate.convertAndSend("/subscribe/group/enter/room/" + roomId, leaveNotice);

        // ✅ 전체 참여자 목록 다시 브로드캐스트
        List<GroupChatUserListResponseDto> participants = groupChatUserRepository
                .findAllByGroupChatRoomId(roomId)
                .stream()
                .map(user -> GroupChatUserListResponseDto.builder()
                        .userId(user.getUser().getId())
                        .nickname(user.getUser().getNickname())
                        .profileImage(imageService.getImageUrl(user.getUser().getProfileImage()))
                        .build())
                .toList();

        GroupChatUserListBroadcastDto updatedList = GroupChatUserListBroadcastDto.builder()
                .roomId(roomId)
                .participants(participants)
                .build();

        messageTemplate.convertAndSend("/subscribe/group/users/room/" + roomId, updatedList);
    }

}
