package com.malnutrition.backend.domain.certification.usercertification.service;

import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.certification.repository.CertificationRepository;
import com.malnutrition.backend.domain.certification.usercertification.dto.UserCertificationRegisterRequestDto;
import com.malnutrition.backend.domain.certification.usercertification.dto.UserCertificationResponseDto;
import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.certification.usercertification.repository.UserCertificationRepository;
import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.dto.ImageResponseDto;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Transactional
    public Page<UserCertificationResponseDto> getCertificationsForUser(Long userId, Pageable pageable) {
        return userCertificationRepository.findByUserId(userId, pageable)
                .map(cert -> UserCertificationResponseDto.builder()
                        .certificationId(cert.getCertification().getId())
                        .certificationName(cert.getCertification().getCertificationCategory().getName()) // Certification에 name 필드 있다고 가정
                        .approveStatus(cert.getApproveStatus())
                        .imageUrl(imageService.getImageUrl(cert.getImage())) // Image에 getUrl() 있다고 가정
                        .acquisitionDate(cert.getAcquisitionDate())
                        .expirationDate(cert.getExpirationDate())
                        .adminComment(cert.getAdminComment())
                        .build());
    }

}
