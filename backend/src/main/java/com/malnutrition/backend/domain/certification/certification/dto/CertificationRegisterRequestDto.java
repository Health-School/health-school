package com.malnutrition.backend.domain.certification.certification.dto;

import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Getter
public class CertificationRegisterRequestDto {

    @NotBlank(message = "자격증 이름은 필수입니다.")
    String name;

    public static Certification from(CertificationRegisterRequestDto certificationRegisterRequestDto, CertificationCategory certificationCategory){
        return Certification.builder()
                .certificationCategory(certificationCategory)
                .build();
    }

}
