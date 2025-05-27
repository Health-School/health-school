package com.malnutrition.backend.domain.chatbotmessage.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.malnutrition.backend.domain.chatbotmessage.config.ChatBotProperties;
import com.malnutrition.backend.domain.chatbotmessage.dto.*;
import com.malnutrition.backend.domain.chatbotmessage.entitiy.ChatBotMessage;
import com.malnutrition.backend.domain.chatbotmessage.enums.ChatBotSenderType;
import com.malnutrition.backend.domain.chatbotmessage.repository.ChatBotMessageRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatBotService {

    private final ChatBotProperties chatBotProperties;
    private final RestTemplate restTemplate;
    private final ChatBotMessageRepository chatBotMessageRepository;
    private final ObjectMapper mapper;
    private final Rq rq;

    @Transactional
    public ChatCompletionResponseDto getChatCompletion(String message) throws JsonProcessingException {
        String apiUrl = chatBotProperties.getApiChatUrl();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + chatBotProperties.getApiKey());

        Message systemMessage = Message.builder()
                .content(chatBotProperties.getSystemMessage())
                .role("system")
                .build();
        Message userMessage = Message.builder()
                .role("user")
                .content(message)
                .build();

        List<Message> messages = new ArrayList<Message>();
        messages.add(systemMessage);
        messages.add(userMessage);
        ChatCompletionRequestDto completionRequestDto = ChatCompletionRequestDto.builder()
                .model(chatBotProperties.getGptModel())
                .max_tokens(1500)
                .temperature(0.7f)
                .messages(messages)
                .build();

        HttpEntity<ChatCompletionRequestDto> chatEntity = new HttpEntity<>(completionRequestDto, headers);

        String body = restTemplate.exchange(apiUrl, HttpMethod.POST, chatEntity, String.class).getBody();
        log.info("json data body : {}", body);

        ChatCompletionResponseDto response = mapper.readValue(body, ChatCompletionResponseDto.class);
        log.info("json data response : {}", response);

        return response;
    }

    public ChatContent getChatContent(ChatCompletionResponseDto chatCompletionResponseDto) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        ChatContent chatContents = null;
        if(!chatCompletionResponseDto.getChoices().isEmpty()){
            String content = chatCompletionResponseDto.getChoices().get(0).getMessage().getContent();
            String cleanedContent = content.replaceAll("(?m)^```json|```$", "").trim();
            chatContents = mapper.readValue(cleanedContent, new TypeReference<ChatContent>(){});
        }
        return chatContents;
    }

    @Transactional
    public ChatMessageResponseDto saveChatMessage(String chatMessage, ChatBotSenderType chatBotSenderType){
        User actor = rq.getActor();
        ChatBotMessage chatBotMessage = ChatBotMessage.builder()
                .user(actor)
                .sender(chatBotSenderType)
                .text(chatMessage)
                .build();
        //timeStamp가 초기화 안 될 수 있으니 flush를 바로 해준다.
        ChatBotMessage savedMessage = chatBotMessageRepository.saveAndFlush(chatBotMessage);

        return ChatMessageResponseDto.builder()
                .message(savedMessage.getText())
                .sender(savedMessage.getSender())
                .createdAt(savedMessage.getTimestamp())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponseDto> getAllChatMessage(){
        User actor = rq.getActor();
        return  chatBotMessageRepository.findChatMessagesByUserId(actor.getId());

    }

}
