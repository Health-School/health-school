package com.malnutrition.backend.domain.chatroom.chatroom.service;

import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomRequestDto;
import com.malnutrition.backend.domain.chatroom.chatroom.dto.ChatRoomResponseDto;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final Rq rq;

    public ChatRoomResponseDto createChatRoom(ChatRoomRequestDto requestDto) {
        User sender = rq.getActor();
        User receiver = userRepository.findById(requestDto.getReceiverId())
                .orElseThrow(() -> new EntityNotFoundException("받는 사람을 찾을 수 없습니다."));
        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("자기 자신에게는 채팅을 보낼 수 없습니다.");
        }
        ChatRoom chatRoom = ChatRoom.builder()
                .sender(sender)
                .receiver(receiver)
                .title(requestDto.getTitle())
                .build();

        ChatRoom saved = chatRoomRepository.save(chatRoom);

        return new ChatRoomResponseDto(saved.getId(), saved.getTitle(), saved.getSender().getNickname(), saved.getReceiver().getNickname());
    }

    public ChatRoomResponseDto getChatRoom(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("해당 채팅방을 찾을 수 없습니다."));

        return new ChatRoomResponseDto(
                chatRoom.getId(),
                chatRoom.getTitle(),
                chatRoom.getSender().getNickname(), // 💥 여기가 null이면 NPE
                chatRoom.getReceiver().getNickname() // 💥 여기도
        );
    }
}
