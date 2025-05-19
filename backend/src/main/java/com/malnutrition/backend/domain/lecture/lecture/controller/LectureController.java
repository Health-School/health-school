package com.malnutrition.backend.domain.lecture.lecture.controller;

import com.malnutrition.backend.domain.lecture.lecture.dto.LectureDto;
import com.malnutrition.backend.domain.lecture.lecture.dto.LectureRequestDto;
import com.malnutrition.backend.domain.lecture.lecture.dto.LectureResponseDto;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.service.LectureService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.service.UserService;
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
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/lectures")
@RequiredArgsConstructor
@Slf4j
public class LectureController {

    private final LectureService lectureService;
    private final Rq rq;
    private final UserService userService;

    @Operation(summary = "강의 추가", description = "새로운 강의를 추가합니다.")
    @PostMapping
    public ResponseEntity<?> addLecture(@RequestBody LectureRequestDto request) {
        LectureLevel lectureLevel = LectureLevel.valueOf(request.getLectureLevel().toUpperCase());
        User user = rq.getActor();

        Optional<Lecture> savedLecture = lectureService.addLecture(request, user, lectureLevel);
        return ResponseEntity.ok(ApiResponse.success(LectureResponseDto.transDto(savedLecture.orElse(null)), "강의 추가 완료"));
    }

    @Operation(summary = "강의 수정", description = "트레이너가 자신의 강의를 수정합니다.")
    @PutMapping("/{lectureId}")
    public ResponseEntity<?> updateLecture(@PathVariable(name = "lectureId") Long lectureId,
                                           @RequestBody LectureRequestDto request) {
        User user = rq.getActor();
        LectureLevel lectureLevel = LectureLevel.valueOf(request.getLectureLevel().toUpperCase());

        Lecture updatedLecture = lectureService.updateLecture(lectureId, request, user, lectureLevel);
        return ResponseEntity.ok(ApiResponse.success(LectureResponseDto.transDto(updatedLecture), "강의 수정 완료"));
    }

    @Operation(summary = "강의 삭제", description = "트레이너가 자신의 강의를 삭제합니다.")
    @DeleteMapping("/{lectureId}")
    public ResponseEntity<?> deleteLecture(@PathVariable(name = "lectureId") Long lectureId) {
        User user = rq.getActor();
        lectureService.deleteLecture(lectureId, user);
        return ResponseEntity.ok(ApiResponse.success(null, "강의 삭제 완료"));
    }

    @Operation(summary = "강의 상태 변경", description = "자신의 강의 상태를 완강으로 변경합니다.")
    @PatchMapping("/{lectureId}/status")
    public ResponseEntity<?> updateLectureStatus(@PathVariable("lectureId") Long lectureId) {
        User user = rq.getActor();
        Lecture updatedLecture = lectureService.transLectureStatus(lectureId, user);
        return ResponseEntity.ok(ApiResponse.success(LectureResponseDto.transDto(updatedLecture), "강의 상태 변경 완료"));
    }

    @GetMapping
    public ResponseEntity<?> getLecturesByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<LectureDto> lectures = lectureService.getLectures(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate")));
        return ResponseEntity.ok(ApiResponse.success(lectures, "조회 성공!"));
    }
}
