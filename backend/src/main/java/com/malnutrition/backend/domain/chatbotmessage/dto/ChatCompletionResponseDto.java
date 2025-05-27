package com.malnutrition.backend.domain.chatbotmessage.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@ToString
public class ChatCompletionResponseDto {
    private String id;
    private String object;
    private long created;
    private List<Choice> choices;
    private String model;
    private Usage usage;
    private String system_fingerprint;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    @ToString
    public static class Choice {
        private int index;
        private Message message;
        private Object logprobs;
        private String finish_reason;

        // getter, setter 메소드들 생략
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    @ToString
    public static class Usage {
        private int prompt_tokens;
        private int completion_tokens;
        private int total_tokens;

        // getter, setter 메소드들 생략
    }
}
