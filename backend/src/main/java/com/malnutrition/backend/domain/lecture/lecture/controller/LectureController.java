package com.malnutrition.backend.domain.lecture.lecture.controller;
import com.malnutrition.backend.domain.lecture.lecture.dto.*;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.service.LectureRankingRedisService;
import com.malnutrition.backend.domain.lecture.lecture.service.LectureService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
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
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/lectures")
@RequiredArgsConstructor
@Slf4j
public class LectureController {

    private final LectureService lectureService;
    private final Rq rq;
    private final UserService userService;
    private final LectureRankingRedisService lectureRankingRedisService;


    @Operation(summary = "특정 강의 조회", description = "강의 상세 페이지 조회")
    @GetMapping("/{lectureId}")
    public ResponseEntity<ApiResponse<LectureDetailDto>> getLecture(@PathVariable("lectureId") Long lectureId) {

        LectureDetailDto lecture = lectureService.getLecture(lectureId);
        return ResponseEntity.ok(ApiResponse.success(lecture, "강의 추가 완료"));
    }

    @GetMapping("/search")
    public List<LectureSearchResponseDto> searchLectures(@RequestParam(name = "keyword") String keyword) {
        return lectureService.searchLecturesByTitle(keyword);
    }

    @Operation(summary = "강의 추가", description = "새로운 강의를 추가합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)// 멀티 파트 파일로 인식
    @PreAuthorize("hasRole('ROLE_TRAINER')")
    public ResponseEntity<ApiResponse<Void>> addLecture(@RequestPart("lectureRequestDto") LectureRequestDto request,
                                        @RequestPart("lectureImage") MultipartFile lectureImage) {
        User user = rq.getActor();
        lectureService.addLecture(request, user, lectureImage);
        return ResponseEntity.ok(ApiResponse.success(null, "강의 추가 완료"));
    }
    @Operation(summary = "강의 수정", description = "트레이너가 자신의 강의를 수정합니다.")
    @PutMapping("/{lectureId}")
    @PreAuthorize("hasRole('ROLE_TRAINER')")
    public ResponseEntity<?> updateLecture(@PathVariable(name = "lectureId") Long lectureId,
                                           @RequestBody LectureRequestDto request) {
        User user = rq.getActor();

        Lecture updatedLecture = lectureService.updateLecture(lectureId, request, user);
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
    @PutMapping("/{lectureId}/status")
    @PreAuthorize("hasRole('ROLE_TRAINER')")
    public ResponseEntity<?> updateLectureStatus(@PathVariable("lectureId") Long lectureId) {
        User user = rq.getActor();
        Lecture updatedLecture = lectureService.transLectureStatus(lectureId, user);
        return ResponseEntity.ok(ApiResponse.success(LectureResponseDto.transDto(updatedLecture), "강의 상태 변경 완료"));
    }
    @GetMapping
    public ResponseEntity<?> getLecturesByPage(
            @RequestParam(defaultValue = "0",name = "page") int page,
            @RequestParam(defaultValue = "10", name = "size") int size,
            @RequestParam(required = false, name = "category") String category,
            @RequestParam(required = false, name = "lectureLevel") LectureLevel lectureLevel
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        Page<LectureDto> lectures = lectureService.getLectures(pageRequest, category, lectureLevel);
        return ResponseEntity.ok(ApiResponse.success(lectures, "조회 성공!"));
    }

    @GetMapping("/trainer-lecture")
    public ResponseEntity<?> getTrainerLectures(){
        List<LectureTrainerDto> lectureTrainers = lectureService.getLectureTrainers();

        return ResponseEntity.ok(ApiResponse.success(lectureTrainers, "트레이너 강의 조회 성공"));
    }

    @Operation(summary = "강의 대시보드 조회", description = "강의 대시보드 조회")
    @GetMapping("/{lectureId}/dashboard")
    public ResponseEntity<ApiResponse<LectureCurriculumDetailDto>> getLectureDashBoard(@PathVariable("lectureId") Long lectureId) {
        LectureCurriculumDetailDto lectureCurriculumDetailDto = lectureService.getLectureCurriculumDetailDto(lectureId);

        return ResponseEntity.ok(ApiResponse.success(lectureCurriculumDetailDto, "강의 대시보드 조회"));
    }


    @Operation(summary = "인기 강의 조회 ", description = "인기 강의 TOP 4 조회")
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<LectureDto>>> getPopularLectures() {
        log.info("요청 오는거 맞냐??");
        List<LectureDto> popularityLectures = lectureService.findPopularityLectures();
        return ResponseEntity.ok(ApiResponse.success(popularityLectures, "인기 강의 TOP 4 조회"));
    }

    @GetMapping("/hot")
    public ResponseEntity<?> getHotLectures() {
        List<LectureDto> todayHotLectures = lectureService.getTodayHotLectures();
        return ResponseEntity.ok(ApiResponse.success(todayHotLectures, "hot lecture 조회 성공"));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyLectures(
            @RequestParam(defaultValue = "0",name = "page") int page,
            @RequestParam(defaultValue = "10", name = "size") int size
    ) {
        Long trainerId = rq.getActor().getId();  // 로그인한 사용자
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));

        Page<LectureDto> myLectures = lectureService.getMyLectures(trainerId, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(myLectures, "내 강의 조회 성공"));
    }
}
