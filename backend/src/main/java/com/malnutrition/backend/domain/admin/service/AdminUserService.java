package com.malnutrition.backend.domain.admin.service;

import com.malnutrition.backend.domain.admin.dto.*;
import com.malnutrition.backend.domain.admin.enums.TrainerVerificationResult;
import com.malnutrition.backend.domain.admin.log.entity.TrainerVerificationLog;
import com.malnutrition.backend.domain.admin.log.repository.TrainerVerificationLogRepository;
import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.certification.usercertification.repository.UserCertificationRepository;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.trainerApplication.repository.TrainerApplicationRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserCertificationRepository userCertificationRepository;
    private final TrainerVerificationLogRepository trainerVerificationLogRepository;
    private final TrainerApplicationRepository trainerApplicationRepository;
    private final ImageService imageService;


    @Transactional(readOnly = true)
    public Page<TrainerApplicationSummaryDto> getTrainerApplicationsByStatus(TrainerVerificationResult verificationResult, Pageable pageable) {
        Page<TrainerApplication> applicationPage = trainerApplicationRepository.findByVerificationResultOrderByCreatedDateDesc(verificationResult, pageable);

        return applicationPage.map(application -> {
            User applicant = application.getUser();
            String name = application.getName();
            return TrainerApplicationSummaryDto.builder()
                    .applicationId(application.getId())
                    .userId(applicant.getId())
                    .userName(name)
                    .userEmail(applicant.getEmail())
                    .userPhoneNumber(applicant.getPhoneNumber())
                    .applicationDate(application.getCreatedDate())
                    .status(application.getVerificationResult())
                    .build();
        });

    }

    @Transactional(readOnly = true)
    public TrainerApplicationDetailResponseDto getTrainerApplicationDetail(Long applicationId) {
        TrainerApplication application = trainerApplicationRepository.findByIdWithDetails(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("해당 강사 신청 정보를 찾을 수 없습니다. ID: " + applicationId));

        User applicantUser = application.getUser();

        ApplicantUserInfoDto applicantUserInfoDto = ApplicantUserInfoDto.builder()
                .userId(applicantUser.getId())
                .name(application.getName())
                .email(applicantUser.getEmail())
                .phoneNumber(applicantUser.getPhoneNumber())
                .profileImageUrl(imageService.getImageUrl(applicantUser.getProfileImage()))
                .build();

        List<SubmittedCertificationResponseDto> submittedCertificationResponseDtos = (application.getSubmittedCertifications() == null)
                ? Collections.emptyList()
                : application.getSubmittedCertifications().stream()
                .map(this::mapToSubmittedCertificationDto)
                .collect(Collectors.toList());

        return TrainerApplicationDetailResponseDto.builder()
                .applicationId(application.getId())
                .applicantUserInfo((applicantUserInfoDto))
                .applicationDate(application.getCreatedDate().toLocalDate())
                .applicationStatus(application.getVerificationResult().getDescription())
                .careerHistory(application.getCareerHistory())
                .expertiseAreas(application.getExpertiseAreas())
                .selfIntroduction(application.getSelfIntroduction())
                .submittedCertifications(submittedCertificationResponseDtos)
                .build();

    }

    private SubmittedCertificationResponseDto mapToSubmittedCertificationDto(UserCertification userCertification) {
        Certification certification = userCertification.getCertification();
        Image certificationImage = userCertification.getImage();



        return SubmittedCertificationResponseDto.builder()
                .userCertificationId(userCertification.getId())
                .certificationName(certification != null ? certification.getCertificationCategory().getName() : "정보 없음")
                .issuingInstitution(certification != null && certification.getIssuingInstitution() != null
                        ? certification.getIssuingInstitution() : "정보 없음")
                .acquisitionDate(userCertification.getAcquisitionDate())
                .expirationDate(userCertification.getExpirationDate())
                .approveStatus(userCertification.getApproveStatus() != null ? userCertification.getApproveStatus().getDescription() : "상태 정보 없음")
                .adminComment(userCertification.getAdminComment())
                .certificationImageUrl(imageService.getImageUrl(certificationImage))
                .certificationFileDownloadUrl(imageService.getImageUrl(certificationImage))
                .build();
    }






    @Transactional
    public void updateUserCertificationVerificationStatus(Long userCertificationId, UserCertificationVerificationRequestDto requestDto) {
        UserCertification userCertification = userCertificationRepository.findById(userCertificationId)
                .orElseThrow(() -> new EntityNotFoundException("ID " + userCertificationId + "에 해당하는 사용자 자격증 정보를 찾을 수 없습니다."));

        ApproveStatus oldStatus = userCertification.getApproveStatus();
        ApproveStatus newStatus = requestDto.getReviewStatus();
        String reason = requestDto.getReason();

        userCertification.setApproveStatus(newStatus);

        log.info("관리자 활동: UserCertification ID [{}]의 검토 상태 변경. 이전 상태: [{}], 새 상태: [{}], 사유: [{}]",
                userCertificationId, oldStatus, newStatus, (reason != null && !reason.isBlank() ? reason : "별도 사유 없음"));

        if(reason != null && !reason.isBlank())
            userCertification.setAdminComment(reason);

    }

    @Transactional
    public void decideTrainerVerification(Long userId, TrainerVerificationRequestDto requestDto) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("ID " + userId + "에 해당하는 사용자를 찾을 수 없습니다."));

        TrainerVerificationResult result = requestDto.getResult();
        String reason = requestDto.getReason();

        User adminUser = getCurrentAdminUser();
        String reasonForLog;

        if (reason != null && !reason.isBlank()) {
            reasonForLog = reason;
        } else {
            // 입력된 사유가 없을 경우
            reasonForLog = (result == TrainerVerificationResult.APPROVE_AS_TRAINER)
                    ? "자격 요건 충족으로 트레이너 자격이 승인되었습니다."
                    : "트레이너 자격 요건이 충족되지 않았거나 기타 사유로 반려되었습니다";
        }

        Role oldRole = targetUser.getRole(); // 현재 역할 기록
        Role newRole = oldRole;

        if(result == TrainerVerificationResult.APPROVE_AS_TRAINER) {
            if (oldRole != Role.TRAINER) {
                targetUser.setRole(Role.TRAINER); // 역할을 TRAINER로 변경
                newRole = Role.TRAINER;
                log.info("관리자 활동: 관리자 ID [{}](으)로 인해 사용자 ID [{}]의 역할이 [{}]에서 [TRAINER](으)로 변경되었습니다. 사유: [{}]",
                        adminUser.getEmail(), userId, oldRole, reasonForLog);
            } else {
                log.info("관리자 활동: 관리자 ID [{}](이)가 트레이너 자격을 승인했으나, 사용자 ID [{}]는 이미 TRAINER 역할입니다. 사유: [{}]",
                        adminUser.getEmail(), userId, reasonForLog);
            }
        } else {
            log.info("관리자 활동: 관리자 ID [{}](이)가 사용자 ID [{}]의 트레이너 자격을 반려했습니다. 사유: [{}]",
                    adminUser.getEmail(), userId, reasonForLog);
        }

        TrainerVerificationLog verificationLog = TrainerVerificationLog.builder()
                .user(targetUser)
                .adminUser(adminUser)
                .decision(result)
                .reason(reasonForLog)
                .processedAt(LocalDateTime.now())
                .build();



        trainerVerificationLogRepository.save(verificationLog);



    }

    private User getCurrentAdminUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("인증된 사용자 정보가 없거나 유효하지 않음");
        }
        String adminEmail = authentication.getName();

        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("관리자 계정(" + adminEmail + ")을 DB 에서 찾을 수 없음."));

        boolean isAdmin = adminUser.getRole() == Role.ADMIN;
        if(!isAdmin)
            throw new AccessDeniedException("사용자(" + adminEmail + ")는 관리자 권한(ROLE_ADMIN)이 없습니다.");

        return adminUser;

    }


}
