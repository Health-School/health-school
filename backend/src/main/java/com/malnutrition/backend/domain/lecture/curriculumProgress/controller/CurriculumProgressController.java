package com.malnutrition.backend.domain.lecture.curriculumProgress.controller;

import com.malnutrition.backend.domain.lecture.curriculumProgress.dto.CurriculumProgressRequestDto;
import com.malnutrition.backend.domain.lecture.curriculumProgress.service.CurriculumProgressService;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import com.malnutrition.backend.global.security.security.CustomUserDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/curriculum-progress")
public class CurriculumProgressController {
    private final CurriculumProgressService curriculumProgressService;
    private final Rq rq;

    @Operation(summary = "커리큘럼 진도 확인", description = "커리큘럼 진도확인하기")
    @PostMapping("/{curriculumId}")
    public ResponseEntity<?> updateProgress(
            @PathVariable(name = "curriculumId") Long curriculumId,
            @RequestBody @Valid CurriculumProgressRequestDto dto) {
        curriculumProgressService.updateOrCreateProgress(
                curriculumId,
                dto
        );
        return ResponseEntity.ok(ApiResponse.success(null, "성공"));
    }


}