package com.malnutrition.backend.domain.admin.report.controller;

import com.malnutrition.backend.domain.admin.report.dto.AdminReportStatusUpdateRequestDto;
import com.malnutrition.backend.domain.admin.report.dto.AdminTrainerNotificationRequestDto;
import com.malnutrition.backend.domain.lecture.report.dto.ReportResponseDto;
import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import com.malnutrition.backend.domain.lecture.report.service.ReportService;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@Tag(name = "Admin Report Management API", description = "관리자용 신고 관리 API")
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminReportController {

    private final ReportService reportService;

    @Operation(summary = "신고 목록 조회 (관리자)",
            description = "관리자가 신고 목록을 필터링 및 페이징하여 조회합니다.",
             tags = {"Admin Report Management API"})
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportResponseDto>>> getReports(
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable,
            @Parameter(description = "신고 처리 상태 (PENDING, RESOLVED, REJECTED). 입력하지 않으면 전체 조회")
            @RequestParam(required = false) ReportStatus status
    ) {
        Page<ReportResponseDto> reportPage = reportService.getReports(pageable, status);
        return ResponseEntity.ok(ApiResponse.success(reportPage, "신고 목록 조회 성공"));
    }


    @Operation(summary = "특정 강의에 대한 신고 목록 조회 (관리자)",
            description = "관리자가 특정 강의에 접수된 신고 목록을 페이징하여 조회합니다.",
            tags = {"Admin Report Management API"})
    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<ApiResponse<Page<ReportResponseDto>>> getReportsByLecture(
            @PathVariable Long lectureId,
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ReportResponseDto> reportPage = reportService.getReportsByLectureId(lectureId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reportPage, "특정 강의 신고 목록 조회 성공"));
    }

    @Operation(summary = "신고 상세 조회 (관리자)",
            description = "관리자가 특정 신고의 상세 정보를 조회합니다.",
            tags = {"Admin Report Management API"})
    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<ReportResponseDto>> getReportDetails(
            @PathVariable Long reportId
    ) {

        try {
            ReportResponseDto reportDetails = reportService.getReportDetailsById(reportId);
            return ResponseEntity.ok(ApiResponse.success(reportDetails, "신고 상세 조회 성공"));
        } catch (IllegalArgumentException e) {
            // 서비스에서 신고를 찾지 못했을 때 발생하는 예외 처리
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail(e.getMessage()));
        }
    }


    @Operation(summary = "신고 상태 변경 (관리자)",
            description = "관리자가 특정 신고 건의 상태를 변경합니다.",
            tags = {"Admin Report Management API"})
    @PutMapping("/{reportId}/status") // 경로를 좀 더 명확하게 /status 추가
    public ResponseEntity<ApiResponse<Void>> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody AdminReportStatusUpdateRequestDto statusUpdateRequestDto // 새로운 DTO 사용
    ) {
        reportService.updateReportStatus(reportId, statusUpdateRequestDto.getStatus());
        return ResponseEntity.ok(ApiResponse.success(null, "신고 상태가 성공적으로 변경되었습니다."));
    }

    @Operation(summary = "신고 관련 강사에게 알림 발송 (관리자)",
            description = "관리자가 특정 신고 건과 관련하여 해당 강의의 강사에게 알림 메시지를 발송합니다.",
            tags = {"Admin Report Management API"})
    @PostMapping("/{reportId}/notify-trainer")
    public ResponseEntity<ApiResponse<Void>> notifyTrainerForReport(
            @Parameter(description = "알림을 발송할 대상 신고 ID") @PathVariable Long reportId,
            @Valid @RequestBody AdminTrainerNotificationRequestDto notificationRequestDto
    ) {
        reportService.sendNotificationToTrainerForReport(reportId, notificationRequestDto.getMessage());
        return ResponseEntity.ok(ApiResponse.success(null, "강사에게 알림을 성공적으로 발송했습니다."));
    }

    @Operation(summary = "신고 삭제 (관리자)",
            description = "관리자가 특정 신고를 시스템에서 삭제합니다.",
            tags = {"Admin Report Management API"})
    @DeleteMapping("/{reportId}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            @PathVariable Long reportId
    ) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok(ApiResponse.success(null, "신고가 성공적으로 삭제되었습니다."));
    }


}
