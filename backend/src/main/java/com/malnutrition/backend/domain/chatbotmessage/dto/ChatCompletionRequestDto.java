package com.malnutrition.backend.domain.chatbotmessage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ChatCompletionRequestDto {
    private String model;
    private float temperature;
    private Integer max_tokens;
    private List<Message> messages;;
}
