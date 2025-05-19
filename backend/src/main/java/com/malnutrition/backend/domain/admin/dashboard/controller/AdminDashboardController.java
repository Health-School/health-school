package com.malnutrition.backend.domain.admin.dashboard.controller;

import com.malnutrition.backend.domain.admin.dashboard.dto.ChartDataDto;
import com.malnutrition.backend.domain.admin.dashboard.dto.MetricWidgetDto;
import com.malnutrition.backend.domain.admin.dashboard.service.AdminDashboardService;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Admin Dashboard API", description = "관리자 대시보드 관련 API")
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @Operation(
            summary = "대시보드 핵심 지표 조회",
            description = "총 사용자 수, 총 강의 수, 일일 완료 주문 건수 등의 핵심 지표와 변화율을 조회합니다",
            tags = {"Admin Dashboard API"}
    )
    @GetMapping("/key-metrics")
    public ResponseEntity<ApiResponse<List<MetricWidgetDto>>> getTopKeyMetrics() {
        List<MetricWidgetDto> metrics = adminDashboardService.getTopKeyMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "핵심 지표 조회 성공"));
    }


    @Operation(summary = "사용자 증가 추이 조회",
            description = "선택된 간격(일간, 주간, 월간)에 따른 누적 사용자 수 추이를 조회합니다.",
            tags = {"Admin Dashboard API"}
    )
    @GetMapping("/user-growth-trend")
    public ResponseEntity<ApiResponse<ChartDataDto>> getUserGrowthTrend(
            @Parameter(description = "데이터 간격 ('daily', 'weekly', 'monthly')", example = "daily")
            @RequestParam(defaultValue = "daily") String interval) {
        try{
            ChartDataDto chartData = adminDashboardService.getUserGrowthTrendByInterval(interval);
            return ResponseEntity.ok(ApiResponse.success(chartData, "사용자 증가 추이 조회 성공"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }

    }

    @Operation(summary = "일별/주별/월별 결제 금액 추이 조회",
            description = "선택된 간격에 따른 결제 금액 추이를 조회합니다.",
            tags = {"Admin Dashboard API"}
    )
    @GetMapping("/sales-amount-trend")
    public ResponseEntity<ApiResponse<ChartDataDto>> getSalesAmountTrend(
            @Parameter(description = "데이터 간격 ('daily', 'weekly', 'monthly' ", example  = "daily")
            @RequestParam(defaultValue = "daily") String interval) {

        try{
            ChartDataDto chartData = adminDashboardService.getSalesAmountTrendByInterval(interval);
            return ResponseEntity.ok(ApiResponse.success(chartData, "결제 금액 추이 조회 성공"));
        } catch(IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }

    }


}
