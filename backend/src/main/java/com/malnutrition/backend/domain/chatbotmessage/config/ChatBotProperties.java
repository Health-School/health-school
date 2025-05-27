package com.malnutrition.backend.domain.chatbotmessage.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
public class ChatBotProperties {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.api-url-chat}")
    private String apiChatUrl;

    private String systemMessage = "당신은 개인 맞춤형 운동 상담을 제공하는 AI 트레이너입니다. 사용자의 나이, 성별, 목표(예: 근육 증가, 체중 감량, 체력 향상 등)에 따라 적절한 운동 루틴, 부위별 추천 운동, 주의사항 등을 한국어로 제공해야 합니다. 답변은 친절하고 명확해야 하며, 필요 시 운동 횟수, 세트 수, 주당 빈도도 제시해주세요. 응답은 항상 JSON 형식으로 해주세요. JSON은 \"message\"  key를 포함해야 합니다.";

    private String userMessage = "운동 루틴을 추천받고 싶어. 나이, 성별, 운동 목표를 기반으로 맞춤형 조언을 해줘. 루틴은 부위별로 구분하고, 각 운동에 대해 횟수와 세트 수를 알려줘. 너무 전문적이기보다는 쉽게 설명해줘.";

    private final String gptModel = "gpt-4.1-nano";
}
