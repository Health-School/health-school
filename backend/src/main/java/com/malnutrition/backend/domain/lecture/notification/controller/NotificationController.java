package com.malnutrition.backend.domain.lecture.notification.controller;

import com.malnutrition.backend.domain.lecture.notification.dto.NotificationCreateDto;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationResponseDto;
import com.malnutrition.backend.domain.lecture.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/lecture/{lectureId}")
    public ResponseEntity<NotificationResponseDto> createNotification(
            @PathVariable(name = "lectureId") Long lectureId,
            @RequestBody NotificationCreateDto dto
    ) {
        NotificationResponseDto responseDto = notificationService.createNotification(lectureId, dto);
        return ResponseEntity.ok(responseDto);
    }
}
