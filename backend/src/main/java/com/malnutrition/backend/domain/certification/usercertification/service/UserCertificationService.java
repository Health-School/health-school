package com.malnutrition.backend.domain.certification.usercertification.service;

import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.certification.repository.CertificationRepository;
import com.malnutrition.backend.domain.certification.usercertification.dto.UserCertificationRegisterRequestDto;
import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.certification.usercertification.repository.UserCertificationRepository;
import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.dto.ImageResponseDto;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserCertificationService {

    private final UserCertificationRepository userCertificationRepository;
    private final CertificationRepository certificationRepository;
    private final ImageService imageService;
    private final ImageProperties imageProperties;
    private final Rq rq;
    @Transactional
    public void registerUserCertification(UserCertificationRegisterRequestDto dto, MultipartFile certificationImage){

        Image image = imageService.saveImageWithStorageChoice(certificationImage, imageProperties.getCertificationUploadPath());
        Certification certification = certificationRepository.findById(dto.getCertificationId()).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 certificationId 입니다."));

        UserCertification userCertification = UserCertification.builder()
                .user(rq.getActor())
                .certification(certification)
                .approveStatus(ApproveStatus.PENDING)
                .image(image)
                .expirationDate(dto.getExpirationDate())
                .build();
        userCertificationRepository.save(userCertification);
    }

}
