package com.malnutrition.backend.domain.lecture.notification.repository;

import com.malnutrition.backend.domain.lecture.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByLectureIdOrderByCreatedDateDesc(Long lectureId);

    Page<Notification> findByLectureId(Long lectureId, Pageable pageable);

}
