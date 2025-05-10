package com.malnutrition.backend.domain.lecture.lecture.controller;

import com.malnutrition.backend.domain.lecture.lecture.dto.LectureRequestDto;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.service.LectureService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.rq.Rq;
import com.malnutrition.backend.global.security.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lectures")
@RequiredArgsConstructor
@Slf4j
public class LectureController {

    private final LectureService lectureService;
    private final Rq rq;
    private final UserService userService;


    @PostMapping
    public ResponseEntity<String> addLecture(@RequestBody LectureRequestDto request, @RequestHeader("Authorization") String accessToken) {
        // lectureLevel을 LectureLevel enum으로 변환
        LectureLevel lectureLevel = LectureLevel.valueOf(request.getLectureLevel().toUpperCase());

        User user = rq.getActor();
        log.info("user {}", user);


        // LectureRequestDto를 Lecture로 변환 후 강의 추가
        lectureService.addLecture(request, user, lectureLevel);
        return ResponseEntity.ok("강의 등록이 완료되었습니다.");
    }
}
