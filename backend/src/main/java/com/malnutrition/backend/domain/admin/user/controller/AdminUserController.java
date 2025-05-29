package com.malnutrition.backend.domain.admin.user.controller;

import com.malnutrition.backend.domain.admin.user.dto.*;
import com.malnutrition.backend.domain.admin.user.service.AdminUserService;
import com.malnutrition.backend.domain.admin.verification.dto.SubmittedCertificationResponseDto;
import com.malnutrition.backend.domain.admin.verification.dto.TrainerApplicationSummaryDto;
import com.malnutrition.backend.domain.lecture.lectureuser.dto.EnrollDto;
import com.malnutrition.backend.domain.order.dto.OrderResponse;
import com.malnutrition.backend.domain.order.dto.SettlementOrderDto;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin User Management API", description = "관리자용 전체 회원 관리 API")
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(summary = "전체 회원 목록 조회 (페이지네이션, 필터링 포함)",
               description = "관리자가 역할에 관계없이 모든 회원 목록을 페이지 단위로 조회합니다.",
               tags = {"Admin User Management API"})
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserListItemDto>>> getAllUsersList(
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable,
            @Parameter(description = "검색 필터 (닉네임 혹은 이메일)") @RequestParam(required = false) String searchFilter,
            @Parameter(description = "사용자 역할") @RequestParam(required = false) Role role,
            @Parameter(description = "사용자 상태") @RequestParam(required = false)UserStatus userStatus
            ) {
        Page<AdminUserListItemDto> userPage = adminUserService.getUsersList(pageable, searchFilter, role, userStatus);
        return ResponseEntity.ok(ApiResponse.success(userPage, "전체 회원 목록 조회 성공"));
    }

    @Operation(summary = "특정 회원 핵심 정보 상세 조회",
            description = "관리자가 특정 회원의 프로필 및 핵심 정보를 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{userId}/details")
    public ResponseEntity<ApiResponse<AdminUserCoreInfoDto>> getUserCoreDetails(
            @PathVariable Long userId)  {
        AdminUserCoreInfoDto userInfo = adminUserService.getCoreUserOrTrainerDetail(userId);
        return ResponseEntity.ok(ApiResponse.success(userInfo, "회원 핵심 정보 조회 성공"));
    }

    @Operation(summary = "특정 회원 수강 중인 강의 목록 조회",
            description = "관리자가 특정 회원이 수강 신청한 강의 목록을 페이징하여 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{userId}/enrolled-lectures")
    public ResponseEntity<ApiResponse<Page<EnrollDto>>> getUserEnrolledLectures(
            @PathVariable Long userId,
            @PageableDefault(size = 5, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<EnrollDto> enrolledLectures = adminUserService.getLecturesForUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(enrolledLectures, "회원 수강 중인 강의 목록 조회 성공"));

    }


    @Operation(summary = "특정 회원 결제 내역 조회",
            description = "관리자가 특정 회원의 결제 내역을 페이징하여 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{userId}/payment-history")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserPaymentHistory(
            @Parameter(description = "조회할 회원의 ID") @PathVariable Long userId,
            @PageableDefault(size = 5, sort = "approvedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OrderResponse> paymentHistory = adminUserService.getPaymentHistoryForUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(paymentHistory, "회원 결제 내역 조회 성공"));
    }

    @Operation(summary = "특정 회원 강사 신청 내역 조회",
            description = "관리자가 특정 회원의 강사 신청 이력을 페이징하여 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{userId}/trainer-application-history")
    public ResponseEntity<ApiResponse<Page<TrainerApplicationSummaryDto>>> getUserTrainerApplicationHistory(
            @Parameter(description = "조회할 회원의 ID") @PathVariable Long userId,
            @PageableDefault(size = 5, sort = "applicationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TrainerApplicationSummaryDto> applicationHistory = adminUserService.getTrainerApplicationHistoryForUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(applicationHistory, "회원 강사 신청 내역 조회 성공"));
    }

    @Operation(summary = "특정 강사의 보유 자격증 (승인 상태) 목록 조회",
            description = "관리자가 특정 강사의 '승인된' 자격증 목록을 페이징하여 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{trainerId}/certifications")
    public ResponseEntity<ApiResponse<Page<SubmittedCertificationResponseDto>>> getTrainerCertifications(
            @PathVariable Long trainerId,
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<SubmittedCertificationResponseDto> certifications = adminUserService.getTrainerCertifications(trainerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(certifications, "강사 자격증 목록 조회 성공"));
    }

    @Operation(summary = "특정 강사의 관리 강의 목록 조회 (페이징)",
            description = "관리자가 특정 강사가 등록한 강의 목록을 페이징하여 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{trainerId}/lectures")
    public ResponseEntity<ApiResponse<Page<AdminLectureDto>>> getLecturesByTrainer(
            @PathVariable Long trainerId,
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AdminLectureDto> lectures = adminUserService.getLecturesByTrainer(trainerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(lectures, "강사 관리 강의 목록 조회 성공"));
    }

    @Operation(summary = "특정 강사의 결제(정산) 내역 조회 (페이징)",
            description = "관리자가 특정 강사에게 정산될 결제(주문) 내역을 페이징하여 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{trainerId}/settlement-orders")
    public ResponseEntity<ApiResponse<Page<SettlementOrderDto>>> getTrainerSettlementOrders(
            @PathVariable Long trainerId,
            @PageableDefault(size = 10, sort = "approvedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<SettlementOrderDto> settlementOrderDtos = adminUserService.getTrainerSettlementOrders(trainerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(settlementOrderDtos, "강사 결제 (정산) 내역 조회 성공"));
    }

    @Operation(summary = "특정 강사의 결산 요약 조회 (총액, 당월, 당해)",
            description = "관리자가 특정 강사의 총 정산액, 이번 달 정산액, 올해 정산액을 조회합니다.",
            tags = {"Admin User Management API"})
    @GetMapping("/{trainerId}/settlement-summary")
    public ResponseEntity<ApiResponse<TrainerSettlementDto>> getTrainerSettlementSummary(
            @PathVariable Long trainerId) {
        TrainerSettlementDto settlementSummary = adminUserService.getTrainerSettlementSummary(trainerId);
        return ResponseEntity.ok(ApiResponse.success(settlementSummary, "강사 결산 요약 조회 성공"));
    }

    @Operation(summary = "특정 회원 상태 변경",
            description = "관리자가 특정 회원의 상태를 변경합니다.",
            tags = {"Admin User Management API"})
    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @Parameter(description = "상태를 변경할 회원의 ID") @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequestDto statusUpdateRequestDto) {

        adminUserService.updateUserStatus(userId, statusUpdateRequestDto);
        return ResponseEntity.ok(ApiResponse.success(null, "회원 상태가 성공적으로 변경되었습니다."));
    }



}
