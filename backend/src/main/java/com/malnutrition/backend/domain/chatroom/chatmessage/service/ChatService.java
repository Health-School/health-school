package com.malnutrition.backend.domain.chatroom.chatmessage.service;
import com.malnutrition.backend.domain.chatroom.chatmessage.dto.ChatMessageUpdateRequestDto;
import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.MessageType;
import com.malnutrition.backend.domain.chatroom.chatmessage.repository.ChatMessageRepository;
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

    @Transactional
    public ChatMessage updateChatMessage(Long messageId, ChatMessageUpdateRequestDto dto, Long userId) {
        // 메시지 찾기
        ChatMessage chatMessage = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));

        // 수정하려는 메시지가 작성자의 것인지 확인
        if (!chatMessage.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("본인이 작성한 메시지만 수정할 수 있습니다.");
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

        chatMessageRepository.delete(message);
    }
}
