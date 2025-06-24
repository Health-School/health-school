package com.malnutrition.backend.domain.chatroom.groupChatMessage.dto;

import lombok.Getter;

@Getter
public class GroupChatForceLeaveRequestDto {
    private String targetNickname; // 강퇴 대상 유저 닉네임
    private String requesterNickname; // 요청자 닉네임 (관리자)
}
