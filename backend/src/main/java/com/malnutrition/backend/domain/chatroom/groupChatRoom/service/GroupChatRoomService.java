package com.malnutrition.backend.domain.chatroom.groupChatRoom.service;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomCreateRequest;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomDetailDto;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomResponseDto;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.repository.GroupChatRoomRepository;
import com.malnutrition.backend.domain.chatroom.groupChatUser.repository.GroupChatUserRepository;
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
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Getter
@Service
public class GroupChatRoomService {
    private final LectureRepository lectureRepository;
    private final GroupChatRoomRepository groupChatRoomRepository;
    private final GroupChatUserRepository groupChatUserRepository;
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
    public List<GroupChatRoomResponseDto> getChatRoomsByLectureId(Long lectureId) {
        List<GroupChatRoom> chatRooms = groupChatRoomRepository.findByLectureIdWithUser(lectureId);
        return chatRooms.stream()
                .map(chatRoom -> GroupChatRoomResponseDto.builder()
                        .id(chatRoom.getId())
                        .name(chatRoom.getName())
                        .trainerId(chatRoom.getCreatedBy().getId())
                        .trainerName(chatRoom.getCreatedBy().getNickname()) // User 엔티티에 name 필드가 있다고 가정
                        .lectureId(chatRoom.getLecture().getId())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupChatRoomDetailDto getGroupChatRoomById(Long roomId) {
        GroupChatRoom room = groupChatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("그룹 채팅방이 존재하지 않습니다."));

        List<String> participantNames = groupChatUserRepository.findByGroupChatRoomId(roomId).stream()
                .map(groupChatUser -> groupChatUser.getUser().getNickname())
                .toList();

        return GroupChatRoomDetailDto.builder()
                .id(room.getId())
                .name(room.getName())
                .trainerName(room.getCreatedBy().getNickname())
                .lectureId(room.getLecture().getId())
                .participants(participantNames)
                .build();
    }
}
