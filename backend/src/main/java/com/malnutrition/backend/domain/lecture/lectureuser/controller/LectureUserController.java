package com.malnutrition.backend.domain.lecture.lectureuser.controller;

import com.malnutrition.backend.domain.lecture.lectureuser.dto.EnrollDto;
import com.malnutrition.backend.domain.lecture.lectureuser.dto.UserResponseDto;
import com.malnutrition.backend.domain.lecture.lectureuser.service.LectureUserService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<?> getMyLectures(
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = rq.getActor();
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Pageable pageable = PageRequest.of(page, size, getSortBy(sort));
        Page<EnrollDto> lectures = lectureUserService.getEnrolledLecturesByUser(user, pageable);
        return ResponseEntity.ok(lectures);
    }


    // 정렬 기준에 따라 Sort 객체 반환
    private Sort getSortBy(String sort) {
        return switch (sort) {
            case "progress" -> Sort.by(Sort.Direction.DESC, "progress"); // 진행률 필드명 맞춰서 변경 필요
            case "name" -> Sort.by(Sort.Direction.ASC, "lecture.title"); // 강의 이름 기준 오름차순
            case "latest" -> Sort.by(Sort.Direction.DESC, "createdDate"); // 최신순(생성일 기준) 기본값
            default -> Sort.by(Sort.Direction.DESC, "createdDate");
        };
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudentsByTrainer(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long trainerId = rq.getActor().getId();
        Pageable pageable = PageRequest.of(page, size);

        Page<UserResponseDto> students = lectureUserService.getStudentsByTrainerId(trainerId, pageable);

        return ResponseEntity.ok(ApiResponse.success(students, "수강생 목록 조회 성공"));
    }
}
