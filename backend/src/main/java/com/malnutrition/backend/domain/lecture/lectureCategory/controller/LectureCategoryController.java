package com.malnutrition.backend.domain.lecture.lectureCategory.controller;

import com.malnutrition.backend.domain.lecture.lectureCategory.dto.LectureCategoryRequestDto;
import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.lecture.lectureCategory.service.LectureCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/lecture_categories")
public class LectureCategoryController {
    private final LectureCategoryService lectureCategoryService;

    // 추가
    @Operation(summary = "카테고리 추가", description = "카테고리 추가 하기")
    @PostMapping
    public ResponseEntity<LectureCategory> addCategory(@RequestBody LectureCategoryRequestDto categoryRequestDto) {
        return ResponseEntity.ok(lectureCategoryService.addLectureCategory(categoryRequestDto.getName(), categoryRequestDto.getDescription()));
    }

    // 조회
    @Operation(summary = "카테고리 조회", description = "원하는 카테고리 조회")
    @GetMapping("{categoryId}")
    public ResponseEntity<LectureCategory> searchCategory(@PathVariable(name = "categoryId") Long categoryId) {
        return ResponseEntity.ok((lectureCategoryService.findCategory(categoryId)));
    }

    @Operation(summary = "카테고리 전체 보기", description = "카테고리 전체보기 또는 전체 검색?")
    @GetMapping
    public ResponseEntity<List<LectureCategory>> allCategory() {
        return ResponseEntity.ok(lectureCategoryService.allCategory());
    }

    @Operation(summary = "카테고리 수정", description = "카테고리 수정하기")
    @PutMapping("{categoryId}")
    public ResponseEntity<LectureCategory> updateCategory(@PathVariable(name = "categoryId") Long categoryId,
                                                          @RequestBody LectureCategoryRequestDto lectureCategoryRequestDto) {
        return ResponseEntity.ok(lectureCategoryService.
                updateCategory(categoryId, lectureCategoryRequestDto.getName(),lectureCategoryRequestDto.getDescription()));
    }
    @Operation(summary = "카테고리 삭제", description = "원하는 카테고리 삭제")
    @DeleteMapping("/{categoryId}")
    public void delete(@PathVariable(name = "categoryId") Long categoryId) {
        lectureCategoryService.deleteCategory(categoryId);
    }

}
