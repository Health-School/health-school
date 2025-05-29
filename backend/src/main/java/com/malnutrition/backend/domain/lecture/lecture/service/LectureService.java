package com.malnutrition.backend.domain.lecture.lecture.service;

import com.malnutrition.backend.domain.certification.certification.repository.CertificationRepository;
import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumDetailDto;
import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.curriculum.repository.CurriculumRepository;
import com.malnutrition.backend.domain.lecture.curriculum.service.CurriculumS3Service;
import com.malnutrition.backend.domain.lecture.curriculum.service.CurriculumService;
import com.malnutrition.backend.domain.lecture.curriculumProgress.entity.CurriculumProgress;
import com.malnutrition.backend.domain.lecture.curriculumProgress.repository.CurriculumProgressRepository;
import com.malnutrition.backend.domain.lecture.lecture.dto.*;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.lecture.lectureCategory.repository.LectureCategoryRepository;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.lecture.like.repository.LikeRepository;
import com.malnutrition.backend.domain.user.user.entity.User;

import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.jmx.access.InvalidInvocationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LectureService {
    private final LectureRepository lectureRepository;
    private final LectureCategoryRepository lectureCategoryRepository;
    private final ImageService imageService;
    private final ImageProperties imageProperties;
    private final LikeRepository likeRepository;
    private final UserService userService;
    private final CurriculumRepository curriculumRepository;
    private final CurriculumS3Service curriculumS3Service;
    private final CertificationRepository certificationRepository;
    private final LectureUserRepository lectureUserRepository;
    private final LectureRankingRedisService lectureRankingRedisService;


    private final Rq rq;
    @Transactional
    public List<LectureSearchResponseDto> searchLecturesByTitle(String keyword) {
        // 1. 강의 제목 키워드로 전체 강의 조회
        List<Lecture> lectures = lectureRepository.findByTitleContaining(keyword);

        // 2. 강의 ID 리스트 추출
        List<Long> lectureIds = lectures.stream()
                .map(Lecture::getId)
                .collect(Collectors.toList());

        // 3. 강의별 평균 점수 한 번에 조회 (강의 ID -> 평균 점수 Map)
        Map<Long, Double> averageScoreMap = likeRepository.findAverageScoresByLectureIds(lectureIds).stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> obj[1] != null ? (Double) obj[1] : 0.0
                ));

        // 4. DTO 매핑
        return lectures.stream()
                .map(lecture -> {
                    Double averageScore = averageScoreMap.getOrDefault(lecture.getId(), 0.0);
                    return LectureSearchResponseDto.transDto(lecture, imageService, averageScore);
                })
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public LectureDetailDto getLecture(Long lectureId){
        Lecture lecture = lectureRepository.findByIdWithAllDetails(lectureId).
                orElseThrow(() -> new IllegalArgumentException("존재하지 않는 lectureId 입니다."));
        //

        Double averageScore = likeRepository.findAverageScoreByLectureId(lectureId);

        if(!Objects.isNull(averageScore)){
            averageScore = Math.round(averageScore * 10) / 10.0;
        }else{
            averageScore = 0.0;
        }
        Image coverImage = lecture.getCoverImage();
        String coverImageUrl = null;
        if(!Objects.isNull(coverImage)){
            coverImageUrl = imageService.getImageUrl(coverImage);
        }
        User trainer = lecture.getTrainer();
        String trainerProfileImageUrl = null;

        Image trainerImage = userService.findProfileImageByUserId(trainer.getId());

        if(!Objects.isNull(trainerImage)) trainerProfileImageUrl = imageService.getImageUrl(trainerImage);

        return LectureDetailDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .content(lecture.getContent())
                .price(lecture.getPrice())
                .lectureStatus(lecture.getLectureStatus().getDescription())
                .lectureLevel(lecture.getLectureLevel().getDescription())
                .trainerName(trainer.getNickname())
                .categoryName(lecture.getLectureCategory().getCategoryName())
                .coverImageUrl(coverImageUrl)
                .trainerProfileImageUrl(trainerProfileImageUrl)
                .averageScore(averageScore)
                .createdAt(lecture.getCreatedDate())
                .build();
    }


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
    @Transactional(readOnly = true)
    public Page<LectureDto> getLectures(Pageable pageable, String category, LectureLevel lectureLevel) {
        // 1차 쿼리: 필터링된 강의 목록 페이징 조회
        Page<Lecture> lectures = lectureRepository.findAllWithFiltersPaged(category, lectureLevel, pageable);

        // 2차 쿼리: 해당 강의들의 평균 평점 조회
        List<Long> lectureIds = lectures.stream()
                .map(Lecture::getId)
                .collect(Collectors.toList());

        Map<Long, Double> scoreMap = likeRepository.findAverageScoresByLectureIds(lectureIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],         // lectureId
                        row -> (Double) row[1]        // averageScore
                ));

        // 최종: DTO 매핑
        return lectures.map(lecture -> {
            String imageProfileUrl = imageService.getImageUrl(lecture.getCoverImage());
            double averageScore = scoreMap.getOrDefault(lecture.getId(), 0.0);
            return LectureDto.from(lecture, imageProfileUrl, averageScore);
        });
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

    @Transactional(readOnly = true)
    public LectureCurriculumDetailDto getLectureCurriculumDetailDto(Long lectureId) {
        // 1. lectrue 데이터 가져오기, 강사, 카테고리 까지
        Lecture lecture = lectureRepository.findByIdWithAllDetails(lectureId).
                orElseThrow(() -> new IllegalArgumentException("존재하지 않는 lectureId 입니다."));
        User actor = rq.getActor();
        List<CurriculumDetailDto> curriculumDetailDtoList = curriculumRepository.findCurriculumDetailsWithProgressByLectureId(lecture.getId(), actor.getId());

        Double averageScore = likeRepository.findAverageScoreByLectureId(lectureId);

        if(averageScore == null) averageScore = 0.0;


        curriculumDetailDtoList.forEach((curriculumDetailDto ->
                curriculumDetailDto.setCurriculumVideoUrl(curriculumS3Service.getViewUrl(curriculumDetailDto.getCurriculumVideoUrl()))));

        User trainer = lecture.getTrainer();
        List<String> allTrainerCertification = certificationRepository.findAllCertificationNamesByUserId(trainer.getId());

        return LectureCurriculumDetailDto.builder()
                .lectureTitle(lecture.getTitle())
                .lectureContent(lecture.getContent())
                .lectureCategory(lecture.getLectureCategory().getCategoryName())
                .lectureLevel(lecture.getLectureLevel().getDescription())
                .trainerNickname(trainer.getNickname())
                .trainerProfileUrl(imageService.getImageUrl(trainer.getProfileImage()))
                .trainerCertificationNames(allTrainerCertification)
                .averageScore(averageScore)
                .curriculumDetailDtoList(curriculumDetailDtoList)
                .build();
    }

    @Transactional(readOnly = true)
    public List<LectureDto> findPopularityLectures(){
        PageRequest pageRequest = PageRequest.of(0, 4);
        //인기 강의 4개 추출
        List<Lecture> lectures = lectureUserRepository.findPopularLecturesWithEntityGraph(pageRequest);

        List<Long> lectureIds = lectures.stream()
                .map(Lecture::getId)
                .collect(Collectors.toList());

        Map<Long, Double> scoreMap = likeRepository.findAverageScoresByLectureIds(lectureIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],         // lectureId
                        row -> (Double) row[1]        // averageScore
                ));

        // 최종: DTO 매핑
        return lectures.stream().map(lecture -> {
            String imageProfileUrl = imageService.getImageUrl(lecture.getCoverImage());
            double averageScore = scoreMap.getOrDefault(lecture.getId(), 0.0);
            return LectureDto.from(lecture, imageProfileUrl, averageScore);
        }).collect(Collectors.toList());
    }

    public List<LectureDto> getTodayHotLectures() {
        List<Long> topIds = lectureRankingRedisService.getTop4LecturesToday();
        if (topIds.isEmpty()) return List.of();

        // 강의 상세 포함하여 조회 (coverImage, lectureCategory, trainer 등 fetch join 포함)
        List<Lecture> unorderedLectures = lectureRepository.findWithDetailsByIdIn(topIds);

        // id -> Lecture 맵핑
        Map<Long, Lecture> lectureMap = unorderedLectures.stream()
                .collect(Collectors.toMap(Lecture::getId, l -> l));

        // 평균 점수 조회 및 매핑
        Map<Long, Double> scoreMap = likeRepository.findAverageScoresByLectureIds(topIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],         // lectureId
                        row -> (Double) row[1]        // averageScore
                ));

        // 순서 보존 및 DTO 매핑
        return topIds.stream()
                .map(id -> {
                    Lecture lecture = lectureMap.get(id);
                    if (lecture == null) return null; // 혹시라도 누락된 경우 방어 코드
                    String imageUrl = imageService.getImageUrl(lecture.getCoverImage());
                    double averageScore = scoreMap.getOrDefault(id, 0.0);
                    return LectureDto.from(lecture, imageUrl, averageScore);
                })
                .filter(Objects::nonNull) // null 방지
                .collect(Collectors.toList());
    }
}
