package com.malnutrition.backend.domain.lecture.lecture.service;

import com.malnutrition.backend.domain.lecture.lecture.dto.LectureRequestDto;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LectureService {
    private final LectureRepository lectureRepository;

    @Transactional
    public Optional<Lecture> addLecture(LectureRequestDto request, User user, LectureLevel lectureLevel) {
        System.out.println("User role: " + user.getRole());
        if (!user.getRole().name().equals("TRAINER")) {
            throw new AccessDeniedException("트레이너만 강의를 등록할 수 있습니다.");
        }

        Lecture lecture = Lecture.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .price(request.getPrice())
                .lectureLevel(lectureLevel)
                .lectureStatus(LectureStatus.PLANNED) // 기본값 설정
                .trainer(user)
                .build();

        return Optional.of(lectureRepository.save(lecture));
    }
}
