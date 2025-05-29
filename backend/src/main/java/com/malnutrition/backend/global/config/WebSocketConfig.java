package com.malnutrition.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
@Configuration // ❗ 반드시 필요
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/subscribe"); // 서버에서 > 클라이언트 메시지 경로
        config.setApplicationDestinationPrefixes("/publish"); // 클라이언트에서 -> 서버 경로
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-stomp") //localhost:8090/ws
                .setAllowedOriginPatterns("http://localhost:3000", "https://www.healthschool.site")
                .addInterceptors()
                .withSockJS();//socket 연결 경로
    }


}
