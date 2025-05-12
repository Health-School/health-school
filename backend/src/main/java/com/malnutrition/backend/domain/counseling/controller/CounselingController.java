package com.malnutrition.backend.domain.counseling.controller;

import com.malnutrition.backend.domain.counseling.dto.CounselingDto;
import com.malnutrition.backend.domain.counseling.service.CounselingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/counselings")
@RequiredArgsConstructor
public class CounselingController {

    private final CounselingService counselingService;

    @PostMapping
    public ResponseEntity<?> createCounseling(@RequestBody CounselingDto dto) {
        try {
            CounselingDto created = counselingService.createCounseling(dto);
            return ResponseEntity.ok(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
