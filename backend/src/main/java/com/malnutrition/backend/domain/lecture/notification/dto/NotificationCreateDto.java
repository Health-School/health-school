package com.malnutrition.backend.domain.lecture.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class NotificationCreateDto {
    private String title;
    private String content;
}
