package com.malnutrition.backend.domain.chatroom.groupChatMessage.repository;

import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
}
