package com.malnutrition.backend.domain.chatroom.chatmessage.repository;

import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoom(ChatRoom chatRoom);
    List<ChatMessage> findByChatRoomIdOrderByCreatedDateAsc(Long chatRoomId);

    Optional<ChatMessage> findTopByChatRoomIdAndSenderIdOrderByCreatedDateDesc(Long chatRoomId, Long senderId);


}
