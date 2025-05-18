package com.malnutrition.backend.domain.admin.controller;


import com.malnutrition.backend.domain.admin.dto.TrainerApplicationDetailResponseDto;
import com.malnutrition.backend.domain.admin.dto.TrainerApplicationSummaryDto;
import com.malnutrition.backend.domain.admin.dto.TrainerVerificationRequestDto;
import com.malnutrition.backend.domain.admin.dto.UserCertificationVerificationRequestDto;
import com.malnutrition.backend.domain.admin.enums.TrainerVerificationResult;
import com.malnutrition.backend.domain.admin.service.AdminUserService;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin User API", description = "관리자용 사용자 관리 API")
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;


    @Operation(
            summary = "강사 자격 신청 목록 조회",
            description = "관리자가 강사 자격 신청 목록을 조회합니다. 상태별 필터링 및 페이징을 지원합니다. ",
            tags = {"Admin User API"}
    )
    @GetMapping("/trainer-applications")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<TrainerApplicationSummaryDto>>> getTrainerApplications(
            @Parameter(description = "조회할 신청 상태")
            @RequestParam(required = false) TrainerVerificationResult result,
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC)Pageable pageable
            ) {

        TrainerVerificationResult verificationResult = (result == null) ? TrainerVerificationResult.PENDING_VERIFICATION : result;

        Page<TrainerApplicationSummaryDto> applications = adminUserService.getTrainerApplicationsByStatus(verificationResult, pageable);

        return ResponseEntity.ok(ApiResponse.success(applications,"강사 자격 신청 목록 조회 성공"));
    }

    @Operation(
            summary = "강사 자격 신청 상세 조회",
            description = "관리자가 특정 강사 자격 신청 건의 상세 정보를 조회합니다.",
            tags = {"Admin User API"}
    )
    @GetMapping("/trainer-applications/{applicationId}")
    public ResponseEntity<ApiResponse<TrainerApplicationDetailResponseDto>> getTrainerApplicationDetail(
            @Parameter(description = "조회할 신청서의 ID")
            @PathVariable Long applicationId) {
        TrainerApplicationDetailResponseDto detailResponseDto = adminUserService.getTrainerApplicationDetail(applicationId);
        return ResponseEntity.ok(ApiResponse.success(detailResponseDto, "강사 자격 신청 상세 정보 조회 성공"));
    }



    @Operation(
            summary = "사용자 자격증 검토 상태 변경",
            description = "관리자가 특정 사용자 자격증의 검토 상태(예: 승인, 반려)와 사유를 업데이트합니다.",
            tags = {"Admin User Management"}
    )
    @PatchMapping("/certifications/{certificationId}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserCertificationStatus(
            @PathVariable("certificationId") Long certificationId,
            @Valid @RequestBody UserCertificationVerificationRequestDto requestDto
            ) {

        adminUserService.updateUserCertificationVerificationStatus(certificationId, requestDto);

        String message = "";
        ApproveStatus newStatus = requestDto.getReviewStatus();

        if (newStatus == ApproveStatus.APPROVAL)
            message = String.format("사용자 자격증(ID: %d)이 성공적으로 승인되었습니다.", certificationId);
        else if (newStatus == ApproveStatus.DISAPPROVAL)
            message = String.format("사용자 자격증(ID: %d)이 반려되었습니다.", certificationId);

        return ResponseEntity.ok(ApiResponse.success(null, message));

    }

    @Operation(
            summary = "트레이너 자격 검증 및 결정",
            description = "관리자가 특정 사용자의 트레이너 자격을 최종적으로 승인하거나 반려합니다.",
            tags = {"Admin User Management"}
    )
    @PutMapping("/{userId}/trainer-verification")
    public ResponseEntity<ApiResponse<Void>> decideTrainerVerification(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody TrainerVerificationRequestDto requestDto) {

        adminUserService.decideTrainerVerification(userId, requestDto);

        String message = requestDto.getResult() == TrainerVerificationResult.APPROVE_AS_TRAINER ?
                                                "트레이너 자격 검증 결과 승인이 완료되었습니다.":
                                                "트레이너 자격 검증 결과 요청이 반려되었습니다.";

        return ResponseEntity.ok(ApiResponse.success(null,message));

    }


}
