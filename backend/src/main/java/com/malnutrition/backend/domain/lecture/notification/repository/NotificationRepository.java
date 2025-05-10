package com.malnutrition.backend.domain.lecture.notification.repository;

import com.malnutrition.backend.domain.lecture.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
