package com.malnutrition.backend.domain.admin.user.controller;

import com.malnutrition.backend.domain.admin.user.dto.AdminUserListItemDto;
import com.malnutrition.backend.domain.admin.user.service.AdminUserService;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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


}
