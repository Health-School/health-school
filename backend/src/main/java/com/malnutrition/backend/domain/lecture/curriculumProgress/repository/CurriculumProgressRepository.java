package com.malnutrition.backend.domain.lecture.curriculumProgress.repository;

import com.malnutrition.backend.domain.lecture.curriculumProgress.entity.CurriculumProgress;
import com.malnutrition.backend.domain.lecture.curriculumProgress.enums.ProgressStatus;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CurriculumProgressRepository extends JpaRepository<CurriculumProgress,Long> {
    Optional<CurriculumProgress> findByUserIdAndCurriculumId(Long userId, Long curriculumId);

    List<CurriculumProgress> findByUserAndLecture(User user, Lecture lecture);

    boolean existsByUserIdAndLectureIdAndStatusNot(Long userId, Long lectureId, ProgressStatus status);

    long countByUserIdAndLectureId(Long userId, Long lectureId);


}
