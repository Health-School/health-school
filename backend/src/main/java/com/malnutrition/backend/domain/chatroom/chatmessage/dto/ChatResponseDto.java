package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ChatResponseDto {
    private Long id;               // 메시지 ID
    private String writerName;     // 작성자 닉네임
    private String message;        // 메시지 내용
    private UserType userType;     // 메시지 타입 (ENTER, LEAVE, TALK)
    private LocalDateTime createdDate; // 생성 시각
}
