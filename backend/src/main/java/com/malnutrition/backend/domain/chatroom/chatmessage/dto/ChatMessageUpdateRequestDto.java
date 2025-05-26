package com.malnutrition.backend.domain.chatroom.chatmessage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageUpdateRequestDto {

    @Schema(description = "수정할 메시지 내용", example = "수정된 메시지입니다.")
    private String message;
}
