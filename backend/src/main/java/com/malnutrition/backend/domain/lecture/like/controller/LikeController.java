package com.malnutrition.backend.domain.lecture.like.controller;

import com.malnutrition.backend.domain.lecture.like.dto.LikeRequestDto;
import com.malnutrition.backend.domain.lecture.like.dto.LikeResponseDto;
import com.malnutrition.backend.domain.lecture.like.dto.LikeUpdateRequestDto;
import com.malnutrition.backend.domain.lecture.like.service.LikeService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/like")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

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
}
