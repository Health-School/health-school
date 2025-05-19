package com.malnutrition.backend.domain.chatroom.chatroom.repository;

import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findBySenderIdOrReceiverId(Long senderId, Long receiverId);
    Optional<ChatRoom> findByScheduleId(Long scheduleId);
}
