package com.malnutrition.backend.domain.chatroom.groupChatRoom.repository;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupChatRoomRepository extends JpaRepository<GroupChatRoom, Long> {
    boolean existsByLecture(Lecture lecture);
}
