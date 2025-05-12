package com.malnutrition.backend.domain.certification.certification.controller;

import com.malnutrition.backend.domain.certification.certification.dto.CertificationRegisterRequestDto;
import com.malnutrition.backend.domain.certification.certification.service.CertificationService;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/certifications")
@Tag(name = "Certification", description = "Certification 관련 API")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class CertificationController {

    private final CertificationService certificationService;

    //자격증 신청
    @Operation(
            summary = "자격증 등록",
            description = "괸리자의 자격증 등록",
            tags = {"Certification"}
    )
    @PostMapping

    public ResponseEntity<ApiResponse<CertificationRegisterRequestDto>> registerCertification(@RequestBody CertificationRegisterRequestDto certificationRegisterRequestDto){
        certificationService.registerCertification(certificationRegisterRequestDto);
        return ResponseEntity.ok().body(ApiResponse.success(certificationRegisterRequestDto, "자격증 등록 성공"));
    }


}
