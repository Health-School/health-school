package com.malnutrition.backend.domain.admin.user.service;

import com.malnutrition.backend.domain.admin.user.dto.*;
import com.malnutrition.backend.domain.admin.verification.dto.SubmittedCertificationResponseDto;
import com.malnutrition.backend.domain.admin.verification.dto.TrainerApplicationSummaryDto;
import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.certification.usercertification.repository.UserCertificationRepository;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lectureuser.dto.EnrollDto;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.lecture.lectureuser.service.LectureUserService;
import com.malnutrition.backend.domain.lecture.like.repository.LikeRepository;
import com.malnutrition.backend.domain.order.dto.OrderResponse;
import com.malnutrition.backend.domain.order.dto.SettlementOrderDto;
import com.malnutrition.backend.domain.order.service.OrderService;
import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.trainerApplication.enums.TrainerVerificationStatus;
import com.malnutrition.backend.domain.user.trainerApplication.repository.TrainerApplicationRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private static final Double DEFAULT_RATING = 0.0;
    private static final Double RATING_SCALE = 10.0;

    private final UserRepository userRepository;
    private final ImageService imageService;
    private final TrainerApplicationRepository trainerApplicationRepository;
    private final UserCertificationRepository userCertificationRepository;
    private final LectureRepository lectureRepository;
    private final LectureUserRepository lectureUserRepository;
    private final LikeRepository likeRepository;
    private final LectureUserService lectureUserService;
    private final OrderService orderService;

    public Page<AdminUserListItemDto> getUsersList(Pageable pageable,
                                                   String searchFilter,
                                                   Role role,
                                                   UserStatus userStatus) {

        Specification<User> spec = (root, query, criteriaBuilder) ->  {
            List<Predicate> predicates = new ArrayList<>();

            if(role != null)
                predicates.add(criteriaBuilder.equal(root.get("role"), role));

            if(searchFilter != null && !searchFilter.isEmpty()) {
                Predicate nickname = criteriaBuilder.like(criteriaBuilder.lower(root.get("nickname")), "%" + searchFilter.toLowerCase() + "%");
                Predicate email = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + searchFilter.toLowerCase() + "%");
                predicates.add(criteriaBuilder.or(nickname, email));
            }

            if(userStatus != null)
                predicates.add(criteriaBuilder.equal(root.get("userStatus"), userStatus));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);

        return userPage.map(user -> AdminUserListItemDto.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdDate(user.getCreatedDate())
                .userStatus(user.getUserStatus() != null ? user.getUserStatus().name() : UserStatus.NORMAL.name())
                .profileImageUrl(imageService.getImageUrl(user.getProfileImage()))
                .build());

    }

    public AdminUserCoreInfoDto getCoreUserOrTrainerDetail(Long userId) {
        User user = userRepository.findByIdWithProfileImage(userId)
                .orElseThrow(() -> new IllegalArgumentException("ID " + userId + " 에 해당하는 사용자를 찾을 수 없습니다."));


        // 빌더 타입 설정
        AdminUserCoreInfoDto.AdminUserCoreInfoDtoBuilder<?,?> builder =
                (user.getRole() == Role.TRAINER)
                ? TrainerCoreInfoDto.builder()
                : AdminUserCoreInfoDto.builder();

        // 공통 필드 세팅
        builder.id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(Optional.ofNullable(user.getRole()).map(Enum::name).orElse(null))
                .userStatus(Optional.ofNullable(user.getUserStatus()).map(Enum::name).orElse(UserStatus.NORMAL.name()))
                .createdDate(user.getCreatedDate())
                .updatedDate(user.getUpdatedDate())
                .profileImageUrl(imageService.getImageUrl(user.getProfileImage()));

        // 강사일 경우, 강사 전용 필드 추가
        if(builder instanceof TrainerCoreInfoDto.TrainerCoreInfoDtoBuilder<?,?> trainerBuilder) {
            trainerApplicationRepository
                    .findTopByUserAndVerificationResultOrderByCreatedDateDesc(
                            user, TrainerVerificationStatus.APPROVE_AS_TRAINER)
                    .ifPresent(application -> trainerBuilder
                            .careerHistory(application.getCareerHistory())
                            .expertiseHistory(application.getExpertiseAreas())
                            .selfIntroduction(application.getSelfIntroduction()));
        }

        return builder.build();

    }

    public Page<EnrollDto> getLecturesForUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return lectureUserService.getEnrolledLecturesByUser(user, pageable);
    }

    public Page<OrderResponse> getPaymentHistoryForUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return orderService.getOrdersByUser(user, pageable);
    }

    public Page<TrainerApplicationSummaryDto> getTrainerApplicationHistoryForUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Page<TrainerApplication> applicationPage = trainerApplicationRepository.findByUserOrderByCreatedDateDesc(user, pageable);

        return applicationPage.map(application -> TrainerApplicationSummaryDto.builder()
                .applicationId(application.getId())
                .userId(application.getUser().getId())
                .userName(application.getName())
                .userEmail(application.getUser().getEmail())
                .userPhoneNumber(application.getUser().getPhoneNumber())
                .applicationDate(application.getCreatedDate())
                .status(application.getVerificationResult())
                .build());
    }

    public Page<SubmittedCertificationResponseDto> getTrainerCertifications(Long trainerId, Pageable pageable) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다."));

        if (trainer.getRole() != Role.TRAINER)
            throw new IllegalArgumentException("해당 사용자는 트레이너가 아닙니다.");

        Page<UserCertification> approvedCertificationPage = userCertificationRepository.findByUserAndApproveStatusWithDetails(trainer, ApproveStatus.APPROVAL, pageable);

        return approvedCertificationPage.map(uc -> {
            Certification certification = uc.getCertification();
            CertificationCategory category = certification.getCertificationCategory();
            Image certificationImage = uc.getImage();

            return SubmittedCertificationResponseDto.builder()
                    .userCertificationId(uc.getId())
                    .certificationName(category != null ? category.getName() : "정보 없음")
                    .issuingInstitution(certification != null ? certification.getIssuingInstitution() : "정보 없음")
                    .acquisitionDate(uc.getAcquisitionDate())
                    .expirationDate(uc.getExpirationDate())
                    .approveStatus(uc.getApproveStatus() != null ? uc.getApproveStatus().getDescription() : "정보 없음")
                    .adminComment(uc.getAdminComment())
                    .certificationImageUrl(imageService.getImageUrl(certificationImage))
                    .certificationFileDownloadUrl(imageService.getImageUrl(certificationImage))
                    .build();
        });
    }

    public Page<AdminLectureDto> getLecturesByTrainer(Long trainerId, Pageable pageable) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다."));

        if(trainer.getRole() != Role.TRAINER)
            throw new IllegalArgumentException("해당 사용자는 트레이너가 아닙니다.");

        Page<Lecture> lecturePage = lectureRepository.findByTrainer(trainer, pageable);

       return lecturePage.map(lecture -> {
           Long totalStudentCount = lectureUserRepository.countDistinctUsersByLecture(lecture);
           if(totalStudentCount == null)
               totalStudentCount = 0L;

           Double averageRating = likeRepository.findAverageScoreByLectureId(lecture.getId());
           if (averageRating == null)
               averageRating = DEFAULT_RATING; // 상수 사용
           else
               averageRating = Math.round(averageRating * RATING_SCALE) / RATING_SCALE;

           return AdminLectureDto.builder()
                   .lectureId(lecture.getId())
                   .title(lecture.getTitle())
                   .totalStudentCount(totalStudentCount)
                   .averageRating(averageRating)
                   .createdDate(lecture.getCreatedDate().toLocalDate())
                   .status(lecture.getLectureStatus().getDescription())
                   .build();
       });


    }

    public Page<SettlementOrderDto> getTrainerSettlementOrders(Long trainerId, Pageable pageable) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다."));

        if(trainer.getRole() != Role.TRAINER)
            throw new IllegalArgumentException("해당 사용자는 트레이너가 아닙니다.");

        return orderService.getTrainerSettlementOrders(trainer, pageable);
    }

    public TrainerSettlementDto getTrainerSettlementSummary(Long trainerId) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다. ID: " + trainerId));

        if (trainer.getRole() != Role.TRAINER) {
            throw new IllegalArgumentException("해당 사용자는 트레이너가 아닙니다.");
        }

        LocalDate now = LocalDate.now();

        Long totalSettlement = orderService.getTotal(trainer);
        Long currentMonthSettlement = orderService.getMonthly(trainer, now.getYear(), now.getMonthValue());
        Long currentYearSettlement = orderService.getYearly(trainer, now.getYear());

        return TrainerSettlementDto.builder()
                .totalSettlement(totalSettlement != null ? totalSettlement : 0L)
                .currentMonthSettlement(currentMonthSettlement != null ? currentMonthSettlement : 0L)
                .currentYearSettlement(currentYearSettlement != null ? currentYearSettlement : 0L)
                .build();
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatusUpdateRequestDto statusUpdateRequestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("ID " + userId + "에 해당하는 사용자를 찾을 수 없습니다."));

        UserStatus newStatus = statusUpdateRequestDto.getUserStatus();

        if (user.getUserStatus() == newStatus)
            return;

        user.setUserStatus(newStatus);
        userRepository.save(user);


    }


}
