package com.malnutrition.backend.domain.user.trainerApplication.service;


import com.malnutrition.backend.domain.alarm.alarm.event.AlarmSendEvent;
import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmType;
import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
import com.malnutrition.backend.domain.certification.category.service.CertificationCategoryService;
import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.certification.service.CertificationService;
import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.user.trainerApplication.dto.TrainerApplicationRequestDto;
import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.trainerApplication.repository.TrainerApplicationRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class TrainerApplicationService {

    private final TrainerApplicationRepository trainerApplicationRepository;
    private final CertificationService certificationService;
    private final CertificationCategoryService certificationCategoryService;
    private final ImageService imageService;
    private final ImageProperties imageProperties;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Rq rq;

    @Transactional
    public void registerTrainerApplication(TrainerApplicationRequestDto trainerApplicationRequestDto, MultipartFile certificationImage){
        User user = rq.getActor();
        // 1. 트레이너 신청 엔티티 생성
        TrainerApplication application = TrainerApplicationRequestDto.from(trainerApplicationRequestDto, user);

        // 2. CertificationCategory 조회
        CertificationCategory category = certificationCategoryService.findByName(trainerApplicationRequestDto.getCertificationName());

        // 3. Certification 생성
        Certification certification = certificationService.registerCertification(category, trainerApplicationRequestDto.getIssuingInstitution());

        // 4. 이미지 저장
        Image image = imageService.saveImageWithStorageChoice(certificationImage, imageProperties.getCertificationUploadPath());

        // 5. UserCertification 생성
        UserCertification userCertification = UserCertification.builder()
                .user(user)
                .certification(certification)
                .approveStatus(ApproveStatus.PENDING) // 초기 상태
                .image(image)
                .acquisitionDate(trainerApplicationRequestDto.getAcquisitionDate())
                .expirationDate(trainerApplicationRequestDto.getExpirationDate())
                .build();

        // 6. 신청서에 추가
        application.addSubmittedCertification(userCertification);

        // 7. 저장
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
