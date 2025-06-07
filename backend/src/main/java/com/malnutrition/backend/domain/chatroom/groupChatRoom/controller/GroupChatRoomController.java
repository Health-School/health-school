package com.malnutrition.backend.domain.chatroom.groupChatRoom.controller;

import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomCreateRequest;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.dto.GroupChatRoomResponse;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.service.GroupChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        GroupChatRoomResponse response = new GroupChatRoomResponse(chatRoom.getId(), chatRoom.getName());
        return ResponseEntity.ok(response);
    }
}