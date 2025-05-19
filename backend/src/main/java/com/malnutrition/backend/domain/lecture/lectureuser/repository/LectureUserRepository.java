package com.malnutrition.backend.domain.lecture.lectureuser.repository;

import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureUserRepository extends JpaRepository<LectureUser, Long> {
    List<LectureUser> findByUser(User user);
    Page<LectureUser> findByUser(User user, Pageable pageable);
}
