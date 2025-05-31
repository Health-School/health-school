package com.malnutrition.backend.domain.lecture.report.controller;

import com.malnutrition.backend.domain.lecture.report.dto.ReportRequestDto;
import com.malnutrition.backend.domain.lecture.report.entity.Report;
import com.malnutrition.backend.domain.lecture.report.enums.ReportStatus;
import com.malnutrition.backend.domain.lecture.report.service.ReportService;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/reports")
public class ReportController {
    private final ReportService reportService;
    private final Rq rq;

    // 신고 등록
    @Operation(summary = "신고하기", description = "사용자가 신고하기")
    @PostMapping("/{lectureId}")
    public ResponseEntity<?> addReport(
            @PathVariable(name = "lectureId") Long lectureId,
            @RequestBody ReportRequestDto request) {

        if (rq.getActor() == null) {
            return ResponseEntity.status(401).build(); // 로그인 안 된 경우
        }

        Long userId = rq.getActor().getId();

        reportService.addReport(userId, lectureId, request.getTitle(), request.getContent(), request.getReportType());
        return ResponseEntity.ok(ApiResponse.success(null,"신고가 접수되었습니다."));
    }

    @Operation(summary = "신고 전체 조회", description = "관리자만 전체를 조회할수 있음")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<?> AllReportsLecture(
            @RequestParam(defaultValue = "0",name = "page") int page,
            @RequestParam(defaultValue = "10", name = "size") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        return ResponseEntity.ok(ApiResponse.success(reportService.AllReports(),"조회성공"));
    }

    // 특정 강의의 신고 조회
    @Operation(summary = "특정 강의 신고 조회", description = "관리자만이 신고된 강의에 대해 조회가 가능")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{lectureId}")
    public ResponseEntity<?> ReportsByLecture(@PathVariable(name = "lectureId") Long lectureId,
                                              @RequestParam(defaultValue = "0", name = "page") int page,
                                              @RequestParam(defaultValue = "10", name = "size") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        return ResponseEntity.ok(ApiResponse.success(reportService.lectureReports(lectureId),"조회성공"));
    }

    // 신고 상태 변경 (처리중,처리완료,기각)
    @Operation(summary = "신고 상태 변경", description = "관리자만이 신고 상태를 변경할수있다.")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{reportId}")
    public ResponseEntity<?> updateStatus(
            @PathVariable(name = "reportId") Long reportId,
            @RequestBody ReportRequestDto request) {

        ReportStatus status = request.getStatus();
        reportService.updateReportStatus(reportId, status);
        return ResponseEntity.ok(ApiResponse.success(null,"신고 상태가 변경되었습니다."));
    }

    // 신고 삭제
    @Operation(summary = "신고 내역 삭제", description = "관리자만이 신고 내역을 삭제 가능")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable(name = "reportId") Long reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok(ApiResponse.success(null,"신고가 삭제되었습니다."));
    }
}
