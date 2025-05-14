package com.malnutrition.backend.global.config;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // 서버에서 > 클라이언트 메시지 경로
        config.setApplicationDestinationPrefixes("/app"); // 클라이언트에서 -> 서버 경로
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") //localhost:8090/ws
                .setAllowedOrigins("*")
                .addInterceptors()
                .withSockJS();//socket 연결 경로
    }


}
