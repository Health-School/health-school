package com.malnutrition.backend.domain.chatroom.groupChatUser.repository;

import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupChatUserRepository extends JpaRepository<GroupChatUser, Long> {
    Optional<GroupChatUser> findByGroupChatRoomIdAndUserId(Long roomId, Long userId);
    List<GroupChatUser> findByGroupChatRoomId(Long roomId);
}
