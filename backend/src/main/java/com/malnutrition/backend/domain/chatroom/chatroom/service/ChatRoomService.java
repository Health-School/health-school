package com.malnutrition.backend.domain.chatroom.chatroom.service;

import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomRequestDto;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomResponseDto;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomUpdateRequestDto;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import com.malnutrition.backend.domain.counseling.schedule.repository.ScheduleRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final Rq rq;

    public ChatRoomResponseDto createChatRoom(ChatRoomRequestDto requestDto) {
        User sender = rq.getActor(); // 현재 로그인한 사용자
        User receiver = userRepository.findById(requestDto.getReceiverId())
                .orElseThrow(() -> new EntityNotFoundException("받는 사람을 찾을 수 없습니다."));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("자기 자신에게는 채팅을 보낼 수 없습니다.");
        }

        Schedule schedule = scheduleRepository.findById(requestDto.getScheduleId())
                .orElseThrow(() -> new EntityNotFoundException("해당 스케줄을 찾을 수 없습니다."));

        ChatRoom chatRoom = ChatRoom.builder()
                .sender(sender)
                .receiver(receiver)
                .schedule(schedule) // 스케줄 추가
                .title(requestDto.getTitle())
                .build();

        ChatRoom saved = chatRoomRepository.save(chatRoom);

        return new ChatRoomResponseDto(
                saved.getId(),
                saved.getTitle(),
                saved.getSender().getNickname(),
                saved.getReceiver().getNickname(),
                saved.getSchedule().getId() // 추가 필드
        );
    }

    public ChatRoomResponseDto getChatRoom(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("해당 채팅방을 찾을 수 없습니다."));

        return new ChatRoomResponseDto(
                chatRoom.getId(),
                chatRoom.getTitle(),
                chatRoom.getSender().getNickname(), // 💥 여기가 null이면 NPE
                chatRoom.getReceiver().getNickname(), // 💥 여기도
                chatRoom.getSchedule().getId()
        );
    }

    @Transactional
    public ChatRoomResponseDto updateChatRoomTitle(Long roomId, ChatRoomUpdateRequestDto dto) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방이 존재하지 않습니다."));
        Long userId = rq.getActor().getId();
        if (!chatRoom.getSender().getId().equals(userId) && !chatRoom.getReceiver().getId().equals(userId)) {
            throw new AccessDeniedException("채팅방 수정 권한이 없습니다.");
        }
        chatRoom.setTitle(dto.getTitle());

        return ChatRoomResponseDto.from(chatRoom);
    }

    @Transactional
    public ChatRoomResponseDto getChatRoomByScheduleId(Long scheduleId) {
        ChatRoom chatRoom = chatRoomRepository.findByScheduleId(scheduleId)
                .orElseThrow(() -> new EntityNotFoundException("해당 스케줄에 대한 채팅방이 존재하지 않습니다."));

        return ChatRoomResponseDto.from(chatRoom);
    }
}
