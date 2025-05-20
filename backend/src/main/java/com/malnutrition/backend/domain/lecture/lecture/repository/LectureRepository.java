package com.malnutrition.backend.domain.lecture.lecture.repository;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    boolean existsByTitle(String title);
    Optional<Lecture> findByTitle(String title);
    Page<Lecture> findAll(Pageable pageable);

    List<Lecture> findByTrainerId(Long trainerId);


}
