package com.malnutrition.backend.domain.lecture.notification.controller;

import com.malnutrition.backend.domain.lecture.notification.dto.NotificationCreateDto;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationResponseDto;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationUpdateDto;
import com.malnutrition.backend.domain.lecture.notification.service.NotificationService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final Rq rq;

    @PostMapping("/lecture/{lectureId}")
    public ResponseEntity<NotificationResponseDto> createNotification(
            @PathVariable(name = "lectureId") Long lectureId,
            @RequestBody NotificationCreateDto dto
    ) {
        NotificationResponseDto responseDto = notificationService.createNotification(lectureId, dto);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<List<NotificationResponseDto>> getNotificationsByLecture(
            @PathVariable(name = "lectureId") Long lectureId
    ) {
        List<NotificationResponseDto> notifications = notificationService.getNotificationsByLecture(lectureId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<?> getNotificationById(
            @PathVariable Long notificationId) {
        try {
            NotificationResponseDto dto = notificationService.getNotificationById(notificationId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("해당 공지 사항을 찾을 수 없습니다.");
        }
    }

    @PutMapping("/{notificationId}")
    public ResponseEntity<?> updateNotification(
            @PathVariable Long notificationId,
            @RequestBody NotificationUpdateDto dto
    ) {
        User user = rq.getActor(); // 현재 로그인 유저
        try {
            NotificationResponseDto updated = notificationService.updateNotification(notificationId, dto, user);
            return ResponseEntity.ok("공지 수정이 완료되었습니다!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        User user = rq.getActor(); // 현재 로그인한 사용자

        try {
            notificationService.deleteNotification(notificationId, user);
            return ResponseEntity.ok("공지사항 삭제가 완료되었습니다!"); // 204 No Content
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("공지 삭제 권한이 없거나 해당 공지사항이 없습니다."); // 400 Bad Request
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
        }
    }
}
