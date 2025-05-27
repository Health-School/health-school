package com.malnutrition.backend.domain.chatbotmessage.entitiy;

import com.malnutrition.backend.domain.chatbotmessage.enums.ChatBotSenderType;
import com.malnutrition.backend.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_bot_messages")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatBotMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private ChatBotSenderType sender;

    @Column(columnDefinition = "TEXT")
    private String text;

    @CreatedDate
    private LocalDateTime timestamp;
}
