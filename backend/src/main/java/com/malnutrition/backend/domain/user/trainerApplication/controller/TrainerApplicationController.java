package com.malnutrition.backend.domain.user.trainerApplication.controller;

import com.malnutrition.backend.domain.certification.usercertification.dto.UserCertificationRegisterRequestDto;
import com.malnutrition.backend.domain.user.trainerApplication.dto.TrainerApplicationRequestDto;
import com.malnutrition.backend.domain.user.trainerApplication.repository.TrainerApplicationRepository;
import com.malnutrition.backend.domain.user.trainerApplication.service.TrainerApplicationService;
import com.malnutrition.backend.global.rp.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trainerApplications")
@RequiredArgsConstructor
public class TrainerApplicationController {

    private final TrainerApplicationService trainerApplicationService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)// 멀티 파트 파일로 인식
    public ResponseEntity<ApiResponse<Void>> registerTrainerApplication(
            @Valid @RequestPart("trainerApplicationRequestDto") TrainerApplicationRequestDto dto,
            @RequestPart("certificationImages") List<MultipartFile> images
    ){
      trainerApplicationService.registerTrainerApplication(dto, images);
      return ResponseEntity.ok().body(ApiResponse.success(null, "트레이너 신청 성공"));
    }
}
