package com.malnutrition.backend.domain.admin.controller;


import com.malnutrition.backend.domain.admin.dto.UserRoleUpdateRequestDto;
import com.malnutrition.backend.global.rp.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vi/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    // private final AdminUserService adminUserService;


    @PutMapping("/{userId}/role-update")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody UserRoleUpdateRequestDto requestDto) {

        // TODO: adminUserService.updateUserRoleAndCertificationStatus(userId, requestDto) 호출

        return ResponseEntity.ok(ApiResponse.success(null, "사용자 역할 변경 완료"));


    }
}
