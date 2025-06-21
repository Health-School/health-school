package com.malnutrition.backend.domain.chatroom.groupChatMessage.repository;

import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    Optional<GroupChatMessage> findTopByGroupChatRoomIdAndSenderIdOrderByCreatedDateDesc(Long roomId, Long senderId);
    List<GroupChatMessage> findAllByGroupChatRoomIdOrderByCreatedDateAsc(Long roomId);

    @Query("SELECT m FROM GroupChatMessage m JOIN FETCH m.sender WHERE m.groupChatRoom.id = :roomId ORDER BY m.createdDate ASC")
    List<GroupChatMessage> findAllWithSenderByGroupChatRoomId(@Param("roomId") Long roomId);

}
