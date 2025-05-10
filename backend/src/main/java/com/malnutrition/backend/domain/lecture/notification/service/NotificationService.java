package com.malnutrition.backend.domain.lecture.notification.service;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationCreateDto;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationResponseDto;
import com.malnutrition.backend.domain.lecture.notification.entity.Notification;
import com.malnutrition.backend.domain.lecture.notification.repository.NotificationRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final LectureRepository lectureRepository;
    private final NotificationRepository notificationRepository;
    private final Rq rq;

    @Transactional
    public NotificationResponseDto createNotification(Long lectureId, NotificationCreateDto dto) {
        User actor = rq.getActor();

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("해당 강의가 존재하지 않습니다."));

        if (!(actor.getRole().name().equals("TRAINER") && lecture.getTrainer().getId().equals(actor.getId()))) {
            try {
                throw new AccessDeniedException("공지사항 작성 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e.getMessage());
            }
        }

        Notification notification = Notification.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .lecture(lecture)
                .build();

        Notification saved = notificationRepository.save(notification);

        return new NotificationResponseDto(
                saved.getId(),
                saved.getTitle(),
                saved.getContent(),
                saved.getLecture().getTitle(),
                saved.getCreatedDate()
        );
    }
    @Transactional
    public List<NotificationResponseDto> getNotificationsByLecture(Long lectureId) {
        List<Notification> notifications = notificationRepository.findByLectureIdOrderByCreatedDateDesc(lectureId);

        return notifications.stream()
                .map(notification -> new NotificationResponseDto(
                        notification.getId(),
                        notification.getTitle(),
                        notification.getContent(),
                        notification.getLecture().getTitle(),
                        notification.getCreatedDate()
                ))
                .collect(Collectors.toList());
    }
}


