package com.malnutrition.backend.domain.lecture.lectureuser.service;

import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.lecture.curriculum.repository.CurriculumRepository;
import com.malnutrition.backend.domain.lecture.curriculumProgress.enums.ProgressStatus;
import com.malnutrition.backend.domain.lecture.curriculumProgress.repository.CurriculumProgressRepository;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;

import com.malnutrition.backend.domain.lecture.lectureuser.dto.EnrollDto;
import com.malnutrition.backend.domain.lecture.lectureuser.dto.UserResponseDto;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LectureUserService {

    private final LectureUserRepository lectureUserRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final Rq rq;
    private final CurriculumRepository curriculumRepository; //
    private final CurriculumProgressRepository curriculumProgressRepository;
    private final ImageProperties imageProperties;
    private final ImageService imageService;


    public Page<EnrollDto> getEnrolledLecturesByUser(User user, Pageable pageable) {
        // 1) 페이징된 LectureUser 리스트 조회
        Page<LectureUser> lectureUsers = lectureUserRepository.findByUser(user, pageable);

        // 2) 한 번에 user의 모든 Order 조회
        List<Order> orderList = orderRepository.findByUser(user);

        // 3) LectureUser(Page<LectureUser>)를 EnrollDto(Page<EnrollDto>)로 변환
        return lectureUsers.map(lu -> {
            // 해당 Lecture에 대한 Order 찾기
            Order matchedOrder = orderList.stream()
                    .filter(o -> o.getLecture().getId().equals(lu.getLecture().getId()))
                    .findFirst()
                    .orElse(null);
            int total = curriculumRepository.countByLecture(lu.getLecture()); // 커리큘럼(영상) 갯수 세기
            int completedVideo = curriculumProgressRepository.findByUserAndLecture(user, lu.getLecture()).stream()
                    .filter(curriculumProgress -> curriculumProgress.getStatus() == ProgressStatus.COMPLETED)
                    .map(curriculumProgress -> curriculumProgress.getCurriculum().getId())
                    .collect(Collectors.toSet()).size(); // 중복 제거
            int progressRate = total > 0 ? (completedVideo * 100 / total) : 0;

            return  EnrollDto.builder()
                    .lectureId (lu.getLecture().getId())
                    .lectureName(lu.getLecture().getTitle())
                    .lectureLevel(lu.getLecture().getLectureLevel().getDescription())
                    .userName(lu.getLecture().getTrainer().getNickname())
                    .startDate(matchedOrder != null ? matchedOrder.getApprovedAt() : null)
                    .progressRate(progressRate)
                    .createdDate(lu.getCreatedDate())
                    .coverImageUrl(imageService.getImageUrl(lu.getLecture().getCoverImage()))
                    .build();
        });
    }

    @Transactional
    public void registerLectureUser(Lecture lecture, User user){
        LectureUser lectureUser = LectureUser.builder()
                .lecture(lecture)
                .user(user)
                .build();
        lectureUserRepository.save(lectureUser);
    }
    public LectureUser getLectureUserWithLecture(Long id) {
        return lectureUserRepository.findWithLectureAndTrainerById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 수강 정보가 존재하지 않습니다."));
    }

    public Page<UserResponseDto> getStudentsByTrainerId(Long trainerId, Pageable pageable) {
        Page<User> users = lectureUserRepository.findDistinctUsersByLectureTrainerId(trainerId, pageable);
        return users.map(UserResponseDto::from);
    }

}