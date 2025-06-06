package com.malnutrition.backend.domain.certification.usercertification.controller;

import com.malnutrition.backend.domain.certification.usercertification.dto.UserCertificationRegisterRequestDto;
import com.malnutrition.backend.domain.certification.usercertification.dto.UserCertificationResponseDto;
import com.malnutrition.backend.domain.certification.usercertification.service.UserCertificationService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/usercertifications")
public class UserCertificationController {

    private final UserCertificationService userCertificationService;
    private final Rq rq;
    // 등록 신청,
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)// 멀티 파트 파일로 인식
    public ResponseEntity<ApiResponse<Void>> registerUserCertification(
            @Valid @RequestPart UserCertificationRegisterRequestDto userCertificationRegisterRequestDto,
            @RequestPart MultipartFile certificationImage
            ){
        userCertificationService.registerUserCertification(userCertificationRegisterRequestDto, certificationImage);
        return ResponseEntity.ok().body(ApiResponse.success(null, "등록 신청 성공"));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<UserCertificationResponseDto>> getMyCertifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = rq.getActor().getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate")); // sort 고정

        Page<UserCertificationResponseDto> result = userCertificationService.getCertificationsForUser(userId, pageable);
        return ResponseEntity.ok(result);
    }
}
