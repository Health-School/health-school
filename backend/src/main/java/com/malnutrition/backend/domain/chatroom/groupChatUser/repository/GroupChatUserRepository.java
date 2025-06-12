package com.malnutrition.backend.domain.chatroom.groupChatUser.repository;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupChatUserRepository extends JpaRepository<GroupChatUser, Long> {
    boolean existsByGroupChatRoomAndUser(GroupChatRoom room, User user);
}