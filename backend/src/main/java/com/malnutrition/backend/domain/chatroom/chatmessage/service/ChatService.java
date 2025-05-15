package com.malnutrition.backend.domain.chatroom.chatmessage.service;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageUpdateRequestDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.MessageType;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import com.malnutrition.backend.domain.chatroom.chatroom.repository.ChatRoomRepository;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    @Transactional
    public ChatMessage updateChatMessage(Long messageId, ChatMessageUpdateRequestDto dto, Long userId) {
        // 메시지 찾기
        ChatMessage chatMessage = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));

        // 수정하려는 메시지가 작성자의 것인지 확인
        if (!chatMessage.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("본인이 작성한 메시지만 수정할 수 있습니다.");
        }

        if (chatMessage.getUserType() != UserType.TALK) {
            throw new IllegalArgumentException("메시지를 수정할 수 없습니다.");
        }

        // 메시지 수정
        chatMessage.setMessage(dto.getMessage());
        return chatMessageRepository.save(chatMessage);
    }

    @Transactional
    public void deleteChatMessage(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));

        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("자신의 메시지만 삭제할 수 있습니다.");
        }

        if (message.getUserType() != UserType.TALK) {
            throw new IllegalArgumentException("메시지를 삭제할 수 없습니다.");
        }

        chatMessageRepository.delete(message);
    }

    @Transactional
    public void handleLeaveAndMaybeDeleteRoom(ChatRoom chatRoom) {
        Long roomId = chatRoom.getId();
        Long senderId = chatRoom.getSender().getId();
        Long receiverId = chatRoom.getReceiver().getId();

        ChatMessage latestSenderMessage = chatMessageRepository
                .findTopByChatRoomIdAndSenderIdOrderByCreatedDateDesc(roomId, senderId)
                .orElse(null);

        ChatMessage latestReceiverMessage = chatMessageRepository
                .findTopByChatRoomIdAndSenderIdOrderByCreatedDateDesc(roomId, receiverId)
                .orElse(null);

        if (latestSenderMessage != null && latestReceiverMessage != null &&
                latestSenderMessage.getUserType() == UserType.LEAVE &&
                latestReceiverMessage.getUserType() == UserType.LEAVE) {

            chatMessageRepository.deleteByChatRoom(chatRoom);
            chatRoomRepository.delete(chatRoom);
        }
    }
}
