package com.malnutrition.backend.domain.lecture.lectureuser.service;

import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.lecture.curriculum.repository.CurriculumRepository;
import com.malnutrition.backend.domain.lecture.curriculumProgress.enums.ProgressStatus;
import com.malnutrition.backend.domain.lecture.curriculumProgress.repository.CurriculumProgressRepository;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;

import com.malnutrition.backend.domain.lecture.lectureuser.dto.EnrollDto;
import com.malnutrition.backend.domain.lecture.lectureuser.dto.UserLectureDto;
import com.malnutrition.backend.domain.lecture.lectureuser.dto.UserResponseDto;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.lecture.lectureuser.enums.CompletionStatus;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
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

    @Transactional(readOnly = true)
    public Page<EnrollDto> getEnrolledLecturesByUser(User user, Pageable pageable) {
        // 1) 페이징된 LectureUser 리스트 조회
        Page<LectureUser> lectureUsers = lectureUserRepository.findByUser(user, pageable);

        // 2) COMPLETED 상태의 Order만 조회
        List<Order> orderList = orderRepository.findByUserAndOrderStatus(user, OrderStatus.COMPLETED);

        // 3) COMPLETED 주문이 있는 강의 ID 목록 추출
        Set<Long> completedLectureIds = orderList.stream()
                .map(o -> o.getLecture().getId())
                .collect(Collectors.toSet());

        // 4) COMPLETED 주문이 있는 강의만 필터링 후 EnrollDto로 변환
        List<EnrollDto> enrollDtoList = lectureUsers.stream()
                .filter(lu -> completedLectureIds.contains(lu.getLecture().getId()))
                .map(lu -> {
                    Order matchedOrder = orderList.stream()
                            .filter(o -> o.getLecture().getId().equals(lu.getLecture().getId()))
                            .findFirst()
                            .orElse(null);
                    int total = curriculumRepository.countByLecture(lu.getLecture());
                    int completedVideo = curriculumProgressRepository.findByUserAndLecture(user, lu.getLecture()).stream()
                            .filter(cp -> cp.getStatus() == ProgressStatus.COMPLETED)
                            .map(cp -> cp.getCurriculum().getId())
                            .collect(Collectors.toSet()).size();
                    int progressRate = total > 0 ? (completedVideo * 100 / total) : 0;

                    return EnrollDto.builder()
                            .lectureId(lu.getLecture().getId())
                            .lectureName(lu.getLecture().getTitle())
                            .lectureLevel(lu.getLecture().getLectureLevel().getDescription())
                            .userName(lu.getLecture().getTrainer().getNickname())
                            .startDate(matchedOrder != null ? matchedOrder.getApprovedAt() : null)
                            .progressRate(progressRate)
                            .createdDate(lu.getCreatedDate())
                            .coverImageUrl(imageService.getImageUrl(lu.getLecture().getCoverImage()))
                            .build();
                })
                .toList();

        // 5) 수동으로 Page 객체 반환
        return new PageImpl<>(enrollDtoList, pageable, enrollDtoList.size());
    }


    @Transactional
    public void registerLectureUser(Lecture lecture, User user){
        LectureUser lectureUser = LectureUser.builder()
                .lecture(lecture)
                .user(user)
                .completionStatus(CompletionStatus.NOT_COMPLETED)
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

    public boolean existsAttendingLecture(Long userId, Long lectureId){
        return lectureUserRepository.existsByUserIdAndLecture_Id(userId, lectureId);
    }

    public List<UserLectureDto> getUsersByLectureId(Long lectureId) {
        List<LectureUser> lectureUsers = lectureUserRepository.findByLectureId(lectureId);
        return lectureUsers.stream()
                .map(lectureUser -> {
                    User user = lectureUser.getUser();
                    return new UserLectureDto(
                            user.getId(),
                            user.getNickname(),
                            user.getEmail(),
                            user.getPhoneNumber(),
                            user.getProfileImage() != null ? imageService.getImageUrl(user.getProfileImage()) : null
                    );
                })
                .collect(Collectors.toList());
    }

    public String getTrainerCompletionRateFormatted() {
        User trainer = rq.getActor();
        long total = lectureUserRepository.countByTrainerId(trainer.getId());
        if (total == 0) return "0.00";

        long completed = lectureUserRepository.countCompletedByTrainerId(trainer.getId());
        double rate = (double) completed / total * 100.0;

        return String.format("%.2f", rate); // 소수 둘째 자리까지 반올림
    }

}