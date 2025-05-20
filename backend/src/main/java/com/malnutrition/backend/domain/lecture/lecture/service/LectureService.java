package com.malnutrition.backend.domain.lecture.lecture.service;

import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.lecture.lecture.dto.LectureDto;
import com.malnutrition.backend.domain.lecture.lecture.dto.LectureRequestDto;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.lecture.lectureCategory.repository.LectureCategoryRepository;
import com.malnutrition.backend.domain.user.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class LectureService {
    private final LectureRepository lectureRepository;
    private final LectureCategoryRepository lectureCategoryRepository;
    private final ImageService imageService;
    private final ImageProperties imageProperties;


    @Transactional
    public void addLecture(LectureRequestDto lectureRequestDto, User user, MultipartFile lectureImage) {
        // 제목이 이미 존재하는지 확인
        if (lectureRepository.existsByTitle(lectureRequestDto.getTitle())) {
            throw new IllegalArgumentException("이미 존재하는 강의 제목입니다.");
        }

        LectureCategory lectureCategory = lectureCategoryRepository.findByCategoryName(lectureRequestDto.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        Image savedImage = imageService.saveImageWithStorageChoice(lectureImage, imageProperties.getLectureUploadPath());

        Lecture lecture = Lecture.builder()
                .title(lectureRequestDto.getTitle())
                .content(lectureRequestDto.getContent())
                .price(lectureRequestDto.getPrice())
                .lectureCategory(lectureCategory)  // 카테고리 추가했음요를레이요
                .lectureLevel(lectureRequestDto.getLectureLevel())
                .lectureStatus(LectureStatus.PLANNED) // 기본값 설정
                .trainer(user)
                .coverImage(savedImage)
                .build();

        lectureRepository.save(lecture);

    }
    @Transactional
    public Page<LectureDto> getLectures(Pageable pageable, String category, LectureLevel lectureLevel) {
        return lectureRepository.findAllWithFiltersPaged(category,lectureLevel,pageable)
                .map((lecture -> {
                    String imageProfileUrl = imageService.getImageUrl(lecture.getCoverImage());
                    return LectureDto.from(lecture,imageProfileUrl);
                }));
    }

    @Transactional(readOnly = true)
    public Lecture findLectureById(Long lectureId){
        return lectureRepository.findById(lectureId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 lectureId 입니다."));
    }

    @Transactional
    public Lecture updateLecture(Long lectureId, LectureRequestDto request, User user) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 lectureId 입니다."));

        if (!lecture.getTrainer().getId().equals(user.getId())) {
            throw new AccessDeniedException("자신의 강의만 수정할 수 있습니다.");
        }

        LectureCategory category = lectureCategoryRepository.findByCategoryName(request.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        lecture.setLectureCategory(category);
        lecture.setTitle(request.getTitle());
        lecture.setContent(request.getContent());
        lecture.setPrice(request.getPrice());
        lecture.setLectureLevel(request.getLectureLevel());

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
    public Lecture transLectureStatus(Long lectureId, User user) {
        Lecture lecture = findLectureById(lectureId);

        if (!lecture.getTrainer().getId().equals(user.getId())) {
            throw new AccessDeniedException("자신의 강의만 상태를 변경할 수 있습니다.");
        }

        lecture.setLectureStatus(LectureStatus.COMPLETED);
        return lectureRepository.save(lecture);
    }


}
