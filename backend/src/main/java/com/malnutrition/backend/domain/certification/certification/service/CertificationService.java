package com.malnutrition.backend.domain.certification.certification.service;

import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
import com.malnutrition.backend.domain.certification.category.service.CertificationCategoryService;
import com.malnutrition.backend.domain.certification.certification.dto.CertificationRegisterRequestDto;
import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.certification.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final CertificationCategoryService certificationCategoryService;
    @Transactional
    public void registerCertification(CertificationRegisterRequestDto certificationRegisterRequestDto){
        String name = certificationRegisterRequestDto.getName();
        if(StringUtils.hasText(name)){
            CertificationCategory category = certificationCategoryService.findByName(name);
            Certification certification = CertificationRegisterRequestDto.from(certificationRegisterRequestDto, category);
            certificationRepository.save(certification);
        }
    }

    @Transactional
    public Certification findCertificationById(Long id){
        return certificationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
    }
    @Transactional
    public Certification registerCertification(CertificationCategory certificationCategory, String issuingInstitution){
        if(!Objects.isNull(certificationCategory)  &&
                StringUtils.hasText(certificationCategory.getName()) &&
                StringUtils.hasText(issuingInstitution)){

            Certification certification = Certification.builder()
                    .certificationCategory(certificationCategory)
                    .issuingInstitution(issuingInstitution)
                    .build();
            return certificationRepository.save(certification);
        }
        throw new RuntimeException("자격증을 추가할 수 없습니다.");
    }

}
