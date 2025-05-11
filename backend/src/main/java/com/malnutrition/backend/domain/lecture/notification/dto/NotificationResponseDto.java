package com.malnutrition.backend.domain.lecture.notification.dto;

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
}
