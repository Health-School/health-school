package com.malnutrition.backend.domain.chatroom.groupChatUser.repository;

import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupChatUserRepository extends JpaRepository<GroupChatUser, Long> {
    Optional<GroupChatUser> findByGroupChatRoomIdAndUserId(Long roomId, Long userId);
    List<GroupChatUser> findByGroupChatRoomId(Long roomId);

    boolean existsByGroupChatRoomIdAndUserId(Long groupChatRoomId, Long userId);

    @Query("""
    SELECT u FROM GroupChatUser u
    JOIN FETCH u.user
    JOIN FETCH u.groupChatRoom g
    JOIN FETCH g.createdBy
    WHERE u.groupChatRoom.id = :roomId
    """)
    List<GroupChatUser> findAllByGroupChatRoomId(@Param("roomId") Long roomId);

    @Modifying
    @Query("DELETE FROM GroupChatUser gcu WHERE gcu.groupChatRoom.id = :roomId AND gcu.user.id = :userId")
    void deleteByGroupChatRoomIdAndUserId(@Param("roomId") Long roomId, @Param("userId") Long userId);

}
