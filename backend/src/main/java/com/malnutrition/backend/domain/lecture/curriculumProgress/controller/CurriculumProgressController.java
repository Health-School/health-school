package com.malnutrition.backend.domain.lecture.curriculumProgress.controller;

import com.malnutrition.backend.domain.lecture.curriculumProgress.service.CurriculumProgressService;
import com.malnutrition.backend.global.rq.Rq;
import com.malnutrition.backend.global.security.security.CustomUserDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/curriculum-progress")
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
}