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

    @Operation(summary = "커리큘럼 재생 시작", description = "사용자의 진도율 상태")
    @PostMapping("/{curriculumId}/start")
    public ResponseEntity<Void> startCurriculum(@PathVariable(name = "curriculumId") Long curriculumId) {

        if (rq.getActor() == null) {
            return ResponseEntity.status(401).build(); // 로그인 안 된 경우
        }

        Long userId = rq.getActor().getId();
        curriculumProgressService.startProgress(userId, curriculumId);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "커리큘럼 진도 확인", description = "커리큘럼 진도확인하기")
    @PatchMapping("/{curriculumId}")
    public ResponseEntity<?> updateProgress(
            @PathVariable(name = "curriculumId") Long curriculumId,
            @RequestBody @Valid CurriculumProgressRequestDto dto) {

        if (rq.getActor() == null) {
            return ResponseEntity.status(401).build();
        }

        curriculumProgressService.updateProgress(
                rq.getActor().getId(),
                curriculumId,
                dto.getProgressRate(),
                dto.getLastWatchedSecond()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "성공"));
    }
}