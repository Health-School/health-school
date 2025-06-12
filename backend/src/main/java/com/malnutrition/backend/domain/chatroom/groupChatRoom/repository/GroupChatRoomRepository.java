package com.malnutrition.backend.domain.chatroom.groupChatRoom.repository;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupChatRoomRepository extends JpaRepository<GroupChatRoom, Long> {
    boolean existsByLecture(Lecture lecture);
    @Query("SELECT g FROM GroupChatRoom g JOIN FETCH g.createdBy WHERE g.lecture.id = :lectureId")
    List<GroupChatRoom> findAllByLectureIdWithCreator(@Param("lectureId") Long lectureId);
}
