package com.malnutrition.backend.domain.lecture.lecture.service;

import com.malnutrition.backend.domain.lecture.lecture.dto.LectureRequestDto;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.lecture.lectureCategory.repository.LectureCategoryRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LectureService {
    private final LectureRepository lectureRepository;
    private final LectureCategoryRepository lectureCategoryRepository;


    @Transactional
    public Optional<Lecture> addLecture(LectureRequestDto request, User user, LectureLevel lectureLevel) {
        System.out.println("User role: " + user.getRole());
        if (!user.getRole().name().equals("TRAINER")) {
            throw new AccessDeniedException("트레이너만 강의를 등록할 수 있습니다.");
        }

        // 제목이 이미 존재하는지 확인
        if (lectureRepository.existsByTitle(request.getTitle())) {
            throw new IllegalArgumentException("이미 존재하는 강의 제목입니다.");
        }

        LectureCategory lectureCategory = lectureCategoryRepository.findByName(request.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        Lecture lecture = Lecture.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .price(request.getPrice())
                .LectureCategory(lectureCategory)  // 카테고리 추가했음요를레이요
                .lectureLevel(lectureLevel)
                .lectureStatus(LectureStatus.PLANNED) // 기본값 설정
                .trainer(user)
                .build();

        return Optional.of(lectureRepository.save(lecture));
    }

    @Transactional(readOnly = true)
    public Lecture findLectureById(Long lectureId){
        return lectureRepository.findById(lectureId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 lectureId 입니다."));
    }

    @Transactional
    public Lecture updateLecture(Long lectureId, LectureRequestDto request, User user, LectureLevel lectureLevel) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException(""));

        if (!lecture.getTrainer().getId().equals(user.getId())) {
            throw new AccessDeniedException("자신의 강의만 수정할 수 있습니다.");
        }

        lecture.setTitle(request.getTitle());
        lecture.setContent(request.getContent());
        lecture.setPrice(request.getPrice());
        lecture.setLectureLevel(lectureLevel);

        return lectureRepository.save(lecture);
    }

    @Transactional
    public void deleteLecture(Long lectureId, User user) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("강의가 존재하지 않습니다."));

        if (!lecture.getTrainer().getId().equals(user.getId())) {
            throw new AccessDeniedException("자신의 강의만 삭제할 수 있습니다.");
        }

        lectureRepository.delete(lecture);
    }

    @Transactional
    public void transLectureStatus(Long lectureId, User user) {
        Lecture lecture = findLectureById(lectureId);

        if (!lecture.getTrainer().getId().equals(user.getId())) {
            throw new AccessDeniedException("자신의 강의만 상태를 변경할 수 있습니다.");
        }

        lecture.setLectureStatus(LectureStatus.COMPLETED);
    }
}
