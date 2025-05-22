package com.malnutrition.backend.domain.chatroom.chatroom.repository;

import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("SELECT cr FROM ChatRoom cr " +
            "JOIN FETCH cr.sender s " +
            "JOIN FETCH cr.receiver r " +
            "WHERE s.id = :senderId OR r.id = :receiverId")
    List<ChatRoom> findBySenderIdOrReceiverId(@Param("senderId") Long senderId,
                                              @Param("receiverId") Long receiverId);

    @Query("SELECT cr FROM ChatRoom cr " +
            "JOIN FETCH cr.schedule s " +
            "WHERE s.id = :scheduleId")
    Optional<ChatRoom> findByScheduleId(@Param("scheduleId") Long scheduleId);
}
