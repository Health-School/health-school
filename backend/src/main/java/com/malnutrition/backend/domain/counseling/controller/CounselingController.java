package com.malnutrition.backend.domain.counseling.controller;

import com.malnutrition.backend.domain.counseling.dto.CounselingDto;
import com.malnutrition.backend.domain.counseling.service.CounselingService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/counselings")
@RequiredArgsConstructor
public class CounselingController {

    private final CounselingService counselingService;

    @PostMapping
    public ResponseEntity<?> createCounseling(@RequestBody CounselingDto dto) {
        try {
            CounselingDto created = counselingService.createCounseling(dto);
            return ResponseEntity.ok(ApiResponse.success(created, "회원 상담지 작성 성공!"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCounseling(@PathVariable Long id, @RequestBody CounselingDto dto) {
        try {
            CounselingDto updated = counselingService.updateCounseling(id, dto);
            return ResponseEntity.ok(ApiResponse.success(updated, "상담지 수정 성공!"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCounseling(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(counselingService.getCounselingById(id), "조회 성공!"));
        } catch (SecurityException e) {         // 권한 없음
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ApiResponse.fail(e.getMessage())));
        } catch (IllegalArgumentException e) {  // 존재하지 않음
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {                 // 기타
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.fail("서버 오류"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCounselingsByUserId(@PathVariable Long userId) {
        try {
            List<CounselingDto> counselingList = counselingService.getCounselingsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success(counselingList, "조회 성공!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("서버 오류가 발생했습니다."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCounseling(@PathVariable Long id) {
        try {
            counselingService.deleteCounseling(id);
            return ResponseEntity.ok(ApiResponse.success(null,"상담지를 삭제했습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("서버 오류가 발생했습니다."));
        }
    }

}
