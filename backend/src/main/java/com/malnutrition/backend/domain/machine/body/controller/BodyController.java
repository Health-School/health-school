package com.malnutrition.backend.domain.machine.body.controller;

import com.malnutrition.backend.domain.machine.body.service.BodyService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/bodies")
@RequiredArgsConstructor
public class BodyController {

    private final BodyService bodyService;

    @GetMapping
    public ResponseEntity<?> getAllBodies() {
        try {
            return ResponseEntity.ok(ApiResponse.success(bodyService.getAllBodies(), "조회 성공!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBody(@RequestParam String name) {
        try {
            return ResponseEntity.ok(ApiResponse.success(bodyService.createBody(name), "생성 성공!"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.fail( "서버 오류"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBody(@PathVariable Long id, @RequestParam String name) {
        try {
            return ResponseEntity.ok(ApiResponse.success(bodyService.updateBody(id, name), "수정 성공!"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.fail("서버 오류"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBody(@PathVariable Long id) {
        try {
            bodyService.deleteBody(id);
            return ResponseEntity.ok(ApiResponse.success(null,"삭제 성공"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.fail("서버 오류"));
        }
    }
}
