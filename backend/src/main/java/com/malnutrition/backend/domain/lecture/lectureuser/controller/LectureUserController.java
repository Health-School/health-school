package com.malnutrition.backend.domain.lecture.lectureuser.controller;

import com.malnutrition.backend.domain.lecture.lectureuser.dto.EnrollDto;
import com.malnutrition.backend.domain.lecture.lectureuser.service.LectureUserService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/lectureUsers")
public class LectureUserController {
    private final Rq rq;
    private final LectureUserService lectureUserService;
    @GetMapping("/my-lectures")
    public ResponseEntity<?> getMyLectures() {
        User user = rq.getActor(); // 현재 로그인한 사용자

        log.info("user {}", user);
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        List<EnrollDto> lectures = lectureUserService.getEnrolledLecturesByUser(user);
        return ResponseEntity.ok(lectures);
    }
}
