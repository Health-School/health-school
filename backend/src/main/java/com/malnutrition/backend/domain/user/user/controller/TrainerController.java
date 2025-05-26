package com.malnutrition.backend.domain.user.user.controller;

import com.malnutrition.backend.domain.user.user.dto.TrainerInfoDto;
import com.malnutrition.backend.domain.user.user.dto.TrainerInfoProcessDto;
import com.malnutrition.backend.domain.user.user.service.TrainerService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trainers")
@RequiredArgsConstructor
@Slf4j
public class TrainerController {
    private final TrainerService trainerService;

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse< List<TrainerInfoDto>>> getPopularTrainers() {
        List<TrainerInfoDto> trainerInfoDtos = trainerService.findPopularTrainersWithHighScore();
        return ResponseEntity.ok(ApiResponse.success(trainerInfoDtos, "전문 트레이너 조회 성공"));
    }
}