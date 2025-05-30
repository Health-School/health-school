package com.malnutrition.backend.domain.chatroom.chatmessage.repository;

import com.malnutrition.backend.domain.chatroom.chatmessage.entity.ChatMessage;
import com.malnutrition.backend.domain.chatroom.chatroom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm FROM ChatMessage cm " +
            "JOIN FETCH cm.chatRoom cr " +
            "WHERE cr = :chatRoom")
    List<ChatMessage> findByChatRoom(@Param("chatRoom") ChatRoom chatRoom);

    @Query("SELECT cm FROM ChatMessage cm " +
            "JOIN FETCH cm.chatRoom cr " +
            "JOIN FETCH cr.sender " +
            "JOIN FETCH cr.receiver " +
            "WHERE cr.id = :chatRoomId " +
            "ORDER BY cm.createdDate ASC")
    List<ChatMessage> findByChatRoomIdOrderByCreatedDateAsc(@Param("chatRoomId") Long chatRoomId);


    Optional<ChatMessage> findTopByChatRoomIdAndSenderIdOrderByCreatedDateDesc(Long chatRoomId, Long senderId);


    @Modifying
    @Query("DELETE FROM ChatMessage cm WHERE cm.chatRoom = :chatRoom")
    void deleteByChatRoom(@Param("chatRoom") ChatRoom chatRoom);
}
