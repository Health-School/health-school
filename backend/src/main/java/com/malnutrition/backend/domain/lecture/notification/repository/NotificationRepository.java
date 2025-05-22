package com.malnutrition.backend.domain.lecture.notification.repository;

import com.malnutrition.backend.domain.lecture.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByLectureIdOrderByCreatedDateDesc(Long lectureId);
    @Query("SELECT n FROM Notification n JOIN FETCH n.lecture l WHERE l.trainer.id = :trainerId")
    Page<Notification> findByLectureTrainerId(@Param("trainerId") Long trainerId, Pageable pageable);

}
