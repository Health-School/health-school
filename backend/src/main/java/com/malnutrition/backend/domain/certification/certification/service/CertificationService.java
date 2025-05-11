package com.malnutrition.backend.domain.certification.certification.service;

import com.malnutrition.backend.domain.certification.certification.dto.CertificationRegisterRequestDto;
import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.certification.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CertificationService {

    private final CertificationRepository certificationRepository;
    @Transactional
    public void registerCertification(CertificationRegisterRequestDto certificationRegisterRequestDto){
        String name = certificationRegisterRequestDto.getName();
        if(StringUtils.hasText(name)){
            Certification certification = CertificationRegisterRequestDto.from(certificationRegisterRequestDto);
            certificationRepository.save(certification);
        }
    }

    @Transactional
    public Certification findCertificationById(Long id){
        return certificationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
    }

}
