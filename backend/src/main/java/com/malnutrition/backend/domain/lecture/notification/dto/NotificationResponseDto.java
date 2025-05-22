package com.malnutrition.backend.domain.lecture.notification.dto;

import com.malnutrition.backend.domain.lecture.notification.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private String title;
    private String content;
    private String lectureName;
    private LocalDateTime createdAt;

    public static NotificationResponseDto fromEntity(Notification notification) {
        return new NotificationResponseDto(
                notification.getId(),
                notification.getTitle(),
                notification.getContent(),
                notification.getLecture().getTitle(), // 혹은 getName() 등 실제 필드명에 맞게
                notification.getCreatedDate()
        );
    }
}
