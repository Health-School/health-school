package com.malnutrition.backend.domain.user.trainerApplication.service;


import com.malnutrition.backend.domain.alarm.alarm.event.AlarmSendEvent;
import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmType;
import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
import com.malnutrition.backend.domain.certification.category.service.CertificationCategoryService;
import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.certification.repository.CertificationRepository;
import com.malnutrition.backend.domain.certification.certification.service.CertificationService;
import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.user.trainerApplication.dto.CertificationItemDto;
import com.malnutrition.backend.domain.user.trainerApplication.dto.TrainerApplicationRequestDto;
import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.trainerApplication.enums.TrainerVerificationStatus;
import com.malnutrition.backend.domain.user.trainerApplication.repository.TrainerApplicationRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainerApplicationService {

    private final TrainerApplicationRepository trainerApplicationRepository;
    private final CertificationRepository certificationRepository;
    private final CertificationService certificationService;
    private final CertificationCategoryService certificationCategoryService;
    private final ImageService imageService;
    private final ImageProperties imageProperties;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Rq rq;

    @Transactional
    public void registerTrainerApplication(TrainerApplicationRequestDto trainerApplicationRequestDto, List<MultipartFile> certificationImages){
        User user = rq.getActor();
        // 1. 트레이너 신청 엔티티 생성
        TrainerApplication application = TrainerApplication.builder()
                .user(user)
                .name(trainerApplicationRequestDto.getName())
                .careerHistory(trainerApplicationRequestDto.getCareerHistory())
                .expertiseAreas(trainerApplicationRequestDto.getExpertiseAreas())
                .selfIntroduction(trainerApplicationRequestDto.getSelfIntroduction())
                .verificationResult(TrainerVerificationStatus.PENDING_VERIFICATION)
                .submittedCertifications(new ArrayList<>())
                .build();

        if(trainerApplicationRequestDto.getCertifications() != null && certificationImages != null
        && trainerApplicationRequestDto.getCertifications().size() == certificationImages.size()) {

            for(int i = 0; i < trainerApplicationRequestDto.getCertifications().size(); i++) {
                CertificationItemDto certificationItemDto = trainerApplicationRequestDto.getCertifications().get(i);
                MultipartFile certImageFile = certificationImages.get(i);

                if(certImageFile == null || certImageFile.isEmpty())
                    throw new IllegalArgumentException("자격증 " + (i + 1) + "의 이미자가 첨부되지 않았습니다.");


                // 1. 자격증 이름 찾기
                CertificationCategory category = certificationCategoryService.findByName(certificationItemDto.getCertificationName());

                // 2. 실제 Certification 엔티티 찾기
                Certification certification = certificationRepository.findByCertificationCategory(category)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "선택하신 자격증 종류('" + category.getName() + "')에 대해 시스템에 등록된 세부 자격증 정보를 찾을수 없습니다."
                        ));

                // 3. 이미지 파일 저장
                Image image = imageService.saveImageWithStorageChoice(certImageFile, imageProperties.getCertificationUploadPath());

                // 4. 사용자 자격증 정보 만들기
                UserCertification userCertification = UserCertification.builder()
                        .user(user)
                        .certification(certification)
                        .approveStatus(ApproveStatus.PENDING)
                        .image(image)
                        .acquisitionDate(certificationItemDto.getAcquisitionDate())
                        .expirationDate(certificationItemDto.getExpirationDate())
                        .build();

                application.addSubmittedCertification(userCertification);

            }

        } else if (trainerApplicationRequestDto.getCertifications() != null && certificationImages != null
        &&  trainerApplicationRequestDto.getCertifications().size() != certificationImages.size()) {
            throw new IllegalArgumentException("제출된 자격증 정보와 이미지 파일의 개수가 일치하지 않습니다." );
        }

        // 신청서 저장
        trainerApplicationRepository.save(application);

        // 이벤트 호출
        AlarmType systemNotice = AlarmType.SYSTEM_NOTICE;
        String message = systemNotice.formatMessage("트레이너 신청서 신청 완료");
        AlarmSendEvent alarmSendEvent = AlarmSendEvent.builder()
                .listener(user)
                .title(systemNotice.formatTitle())
                .message(message)
                .url(null)
                .build();
        applicationEventPublisher.publishEvent(alarmSendEvent);
    }
}
