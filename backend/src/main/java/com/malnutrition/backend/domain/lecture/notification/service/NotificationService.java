package com.malnutrition.backend.domain.lecture.notification.service;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationCreateDto;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationResponseDto;
import com.malnutrition.backend.domain.lecture.notification.dto.NotificationUpdateDto;
import com.malnutrition.backend.domain.lecture.notification.entity.Notification;
import com.malnutrition.backend.domain.lecture.notification.repository.NotificationRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @Transactional(readOnly = true)
    public NotificationResponseDto getNotificationById(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 공지사항을 찾을 수 없습니다."));

        return new NotificationResponseDto(
                notification.getId(),
                notification.getTitle(),
                notification.getContent(),
                notification.getLecture().getTitle(),
                notification.getCreatedDate()
        );
    }

    @Transactional
    public NotificationResponseDto updateNotification(Long notificationId, NotificationUpdateDto dto, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 공지사항을 찾을 수 없습니다."));

        Lecture lecture = notification.getLecture();

        // 작성자 검증: 강의 작성자(trainer)의 id와 현재 사용자 id 비교
        if (!lecture.getTrainer().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new IllegalArgumentException("공지사항을 수정할 권한이 없습니다.");
        }

        // 수정
        notification.setTitle(dto.getTitle());
        notification.setContent(dto.getContent());

        return new NotificationResponseDto(
                notification.getId(),
                notification.getTitle(),
                notification.getContent(),
                lecture.getTitle(),
                notification.getCreatedDate()
        );
    }

    @Transactional
    public void deleteNotification(Long notificationId, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 공지사항을 찾을 수 없습니다."));

        Lecture lecture = notification.getLecture();

        // 작성자 검증: 강의 작성자(trainer)의 id와 현재 사용자 id 비교
        if (!lecture.getTrainer().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new IllegalArgumentException("공지사항을 수정할 권한이 없습니다.");
        }

        notificationRepository.delete(notification);
    }
    @Transactional
    public List<NotificationResponseDto> getNotificationsByLecture(Long lectureId, int page, int size) {
        // JPA 페이징 처리
        Pageable pageable = (Pageable) PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        Page<Notification> notifications = notificationRepository.findByLectureId(lectureId, pageable);

        return notifications.getContent().stream()
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


