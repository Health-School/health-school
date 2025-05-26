package com.malnutrition.backend.domain.lecture.like.controller;

import com.malnutrition.backend.domain.lecture.like.dto.LikeRequestDto;
import com.malnutrition.backend.domain.lecture.like.dto.LikeResponseDto;
import com.malnutrition.backend.domain.lecture.like.dto.LikeUpdateRequestDto;
import com.malnutrition.backend.domain.lecture.like.service.LikeService;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/like")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;
    private final Rq rq;

    @GetMapping
    public ResponseEntity<ApiResponse<LikeResponseDto>> getLectureScore(@RequestParam Long lectureId){
        double likeAverageScore = likeService.getLikeAverageScore(lectureId);
        LikeResponseDto likeResponseDto = new LikeResponseDto(likeAverageScore);
        return ResponseEntity.ok(ApiResponse.success(likeResponseDto, "average 조회 완료"));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<LikeResponseDto>> saveOrUpdateLikeScore(@RequestBody LikeUpdateRequestDto likeRequestDto){
        double score = likeService.saveOrUpdateLikeScore(likeRequestDto.getLectureId(), likeRequestDto.getScore());

        LikeResponseDto likeResponseDto = new LikeResponseDto(score);
        return ResponseEntity.ok(ApiResponse.success(likeResponseDto, "수정 성공!"));
    }

    @GetMapping("/my-lectures/average")
    public ResponseEntity<ApiResponse<LikeResponseDto>> getMyLecturesAverageScore() {
        Long trainerId = rq.getActor().getId();
        double average = likeService.getOverallAverageScoreForTrainer(trainerId);
        return ResponseEntity.ok(ApiResponse.success(new LikeResponseDto(average), "내 모든 강의의 평균 평점 조회 완료"));
    }
}
