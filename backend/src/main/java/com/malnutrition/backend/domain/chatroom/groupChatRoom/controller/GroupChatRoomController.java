package com.malnutrition.backend.domain.chatroom.groupChatRoom.controller;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomCreateRequest;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomResponse;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.service.GroupChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/group-chat-rooms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_TRAINER')")
public class GroupChatRoomController {

    private final GroupChatRoomService groupChatRoomService;

    @PostMapping
    public ResponseEntity<GroupChatRoomResponse> createGroupChatRoom(
            @RequestBody GroupChatRoomCreateRequest request
    ) {
        GroupChatRoom chatRoom = groupChatRoomService.createGroupChatRoom(request);
        GroupChatRoomResponse response = new GroupChatRoomResponse(chatRoom.getId(), chatRoom.getName(), chatRoom.getCreatedBy().getNickname());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<List<GroupChatRoomResponse>> getGroupChatRoomsByLecture(
            @PathVariable Long lectureId
    ) {
        List<GroupChatRoom> rooms = groupChatRoomService.getGroupChatRoomsByLecture(lectureId);
        List<GroupChatRoomResponse> response = rooms.stream()
                .map(GroupChatRoomResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }


}