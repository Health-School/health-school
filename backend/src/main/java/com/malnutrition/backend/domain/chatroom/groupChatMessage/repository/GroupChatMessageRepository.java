package com.malnutrition.backend.domain.chatroom.groupChatMessage.repository;

import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    Optional<GroupChatMessage> findTopByGroupChatRoomIdAndSenderIdOrderByCreatedDateDesc(Long roomId, Long senderId);
}
