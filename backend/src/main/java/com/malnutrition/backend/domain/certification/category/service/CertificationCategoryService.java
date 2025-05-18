package com.malnutrition.backend.domain.certification.category.service;

import com.malnutrition.backend.domain.certification.category.dto.CertificationCategoryDto;
import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
import com.malnutrition.backend.domain.certification.category.repository.CertificationCategoryRepository;
import com.malnutrition.backend.domain.certification.certification.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificationCategoryService  {
    private final CertificationCategoryRepository certificationCategoryRepository;

    public CertificationCategory findByName(String name){
        return certificationCategoryRepository.findByName(name).orElseThrow(() -> new IllegalArgumentException( "존재하지 않는 name 입니다."));
    }
    public List<CertificationCategoryDto> findAll(){
        return certificationCategoryRepository.findAll().stream()
                .map((certificationCategory) -> new CertificationCategoryDto(certificationCategory.getName()))
                .collect(Collectors.toList());

    }


}
