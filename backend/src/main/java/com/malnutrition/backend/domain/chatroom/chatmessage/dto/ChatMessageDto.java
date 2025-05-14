package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private Long roomId;          // 방 ID
    private String writerName;    // 작성자 (보낸 사람)
    private String receiverName;  // 수신자
    private String message;       // 메시지 본문
}
