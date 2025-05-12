package com.malnutrition.backend.domain.machine.body.controller;

import com.malnutrition.backend.domain.machine.body.service.BodyService;
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
            return ResponseEntity.ok(bodyService.getAllBodies());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBody(@RequestParam String name) {
        try {
            return ResponseEntity.ok(bodyService.createBody(name));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "서버 오류"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBody(@PathVariable Long id, @RequestParam String name) {
        try {
            return ResponseEntity.ok(bodyService.updateBody(id, name));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "서버 오류"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBody(@PathVariable Long id) {
        try {
            bodyService.deleteBody(id);
            return ResponseEntity.ok(Map.of("message", "삭제 성공"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "서버 오류"));
        }
    }
}
