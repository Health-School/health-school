package com.malnutrition.backend.domain.chatroom.groupChatRoom.service;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomCreateRequest;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.repository.GroupChatRoomRepository;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.persistence.EntityNotFoundException;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.webjars.NotFoundException;

import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Getter
@Service
public class GroupChatRoomService {
    private final LectureRepository lectureRepository;
    private final GroupChatRoomRepository groupChatRoomRepository;
    private final Rq rq;
    public GroupChatRoom createGroupChatRoom(GroupChatRoomCreateRequest request) {
        User user = rq.getActor();

        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new EntityNotFoundException("강의를 찾을 수 없습니다."));

        if (!lecture.getTrainer().getId().equals(user.getId())) {
            try {
                throw new AccessDeniedException("채팅방 생성 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        if (groupChatRoomRepository.existsByLecture(lecture)) {
            throw new IllegalStateException("이미 해당 강의의 채팅방이 존재합니다.");
        }

        GroupChatRoom chatRoom = GroupChatRoom.builder()
                .name(request.getName())
                .lecture(lecture)
                .createdBy(rq.getActor())
                .participants(new ArrayList<>())
                .messages(new ArrayList<>())
                .build();

        return groupChatRoomRepository.save(chatRoom);
    }

    @Transactional
    public List<GroupChatRoom> getGroupChatRoomsByLecture(Long lectureId) {
        return groupChatRoomRepository.findAllByLectureIdWithCreator(lectureId);
    }
}
