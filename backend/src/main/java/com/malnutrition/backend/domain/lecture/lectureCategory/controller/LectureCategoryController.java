package com.malnutrition.backend.domain.lecture.lectureCategory.controller;

import com.malnutrition.backend.domain.lecture.lectureCategory.dto.LectureCategoryRequestDto;
import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.lecture.lectureCategory.service.LectureCategoryService;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/lecture_categories")
public class LectureCategoryController {
    private final LectureCategoryService lectureCategoryService;

    // 추가
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "카테고리 추가", description = "카테고리 추가 하기")
    @PostMapping
    public ResponseEntity<ApiResponse<LectureCategory>> addCategory(@RequestBody LectureCategoryRequestDto categoryRequestDto) {
        return ResponseEntity.ok(ApiResponse.success(lectureCategoryService.addLectureCategory(categoryRequestDto.getName(), categoryRequestDto.getDescription()),"카테고리 추가 성공") );
    }

    // 조회
    @Operation(summary = "카테고리 조회", description = "원하는 카테고리 조회")
    @GetMapping("{categoryId}")
    public ResponseEntity<ApiResponse<LectureCategory>> searchCategory(@PathVariable(name = "categoryId") Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(lectureCategoryService.findCategory(categoryId), "카테고리 조회 성공"));
    }

    @Operation(summary = "카테고리 전체 보기", description = "카테고리 전체보기 또는 전체 검색?")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureCategory>>> allCategory() {
        return ResponseEntity.ok(ApiResponse.success(lectureCategoryService.allCategory(), "카테고리 전체 조회 성공"));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "카테고리 수정", description = "카테고리 수정하기")
    @PutMapping("{categoryId}")
    public ResponseEntity<ApiResponse<LectureCategory>> updateCategory(@PathVariable(name = "categoryId") Long categoryId,
                                                          @RequestBody LectureCategoryRequestDto lectureCategoryRequestDto) {
        return ResponseEntity.ok(ApiResponse.success(lectureCategoryService.
                updateCategory(categoryId, lectureCategoryRequestDto.getName(),lectureCategoryRequestDto.getDescription()), "카테고리 수정 성공"));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "카테고리 삭제", description = "원하는 카테고리 삭제")
    @DeleteMapping("/{categoryId}")
    public void delete(@PathVariable(name = "categoryId") Long categoryId) {
        lectureCategoryService.deleteCategory(categoryId);
    }

}
