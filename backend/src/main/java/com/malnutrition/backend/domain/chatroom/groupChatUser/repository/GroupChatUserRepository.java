package com.malnutrition.backend.domain.chatroom.groupChatUser.repository;

import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupChatUserRepository extends JpaRepository<GroupChatUser, Long> {
    Optional<GroupChatUser> findByGroupChatRoomIdAndUserId(Long roomId, Long userId);
    List<GroupChatUser> findByGroupChatRoomId(Long roomId);

    boolean existsByGroupChatRoomIdAndUserId(Long groupChatRoomId, Long userId);

    @Query("SELECT u FROM GroupChatUser u JOIN FETCH u.user WHERE u.groupChatRoom.id = :roomId")
    List<GroupChatUser> findAllByGroupChatRoomId(@Param("roomId") Long roomId);
}
