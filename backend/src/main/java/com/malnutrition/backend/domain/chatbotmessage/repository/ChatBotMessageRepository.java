package com.malnutrition.backend.domain.chatbotmessage.repository;


import com.malnutrition.backend.domain.chatbotmessage.dto.ChatMessageResponseDto;
import com.malnutrition.backend.domain.chatbotmessage.entitiy.ChatBotMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatBotMessageRepository  extends JpaRepository<ChatBotMessage, Long> {
    @Query("SELECT new com.malnutrition.backend.domain.chatbotmessage.dto.ChatMessageResponseDto(m.text, m.sender, m.timestamp) " +
            "FROM ChatBotMessage m " +
            "WHERE m.user.id = :userId " +
            "ORDER BY m.timestamp ASC")
    List<ChatMessageResponseDto> findChatMessagesByUserId(@Param("userId") Long userId);
}
