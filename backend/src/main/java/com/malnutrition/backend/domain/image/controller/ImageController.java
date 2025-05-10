package com.malnutrition.backend.domain.image.controller;

import com.malnutrition.backend.domain.image.dto.ImageResponseDto;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/images")
@Slf4j
public class ImageController {

    private final ImageService imageService;
    private final Rq rq;

    //  이미지 업로드
    @Operation(summary = "이미지 업로드", description = "json형태로 받기 + 이미지 파일 꼭 있어야 작동.")
    @PostMapping(value = "/profile/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImageResponseDto>> uploadImage(@RequestPart("profileImage") MultipartFile file) {
        User actor = rq.getActor();
        ImageResponseDto savedImage = imageService.saveImageWithStorageChoice(file, actor.getId());
        ApiResponse<ImageResponseDto> response = ApiResponse.success(savedImage, "이미지 업로드 성공");
        return ResponseEntity.ok(response);
    }

    // 이미지 단건 조회
    @GetMapping("/{id}")
    @Operation(summary = "이미지 단건 조회", description = "ID로 이미지를 조회합니다.")
    public ResponseEntity<ApiResponse<Image>> getImage(@PathVariable("id") Long id) {
        Optional<Image> image = imageService.getImageById(id);
        return image.map(value -> ResponseEntity.ok(ApiResponse.success(value, "이미지 조회 성공")))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.fail("해당 ID의 이미지가 존재하지 않습니다.")));
    }

    // 이미지 전체 조회
    @GetMapping
    @Operation(summary = "이미지 전체 조회", description = "이미지 전체조회 합니다.")
    public ResponseEntity<ApiResponse<List<Image>>> getAllImages() {
        List<Image> images = imageService.getAllImages();
        return ResponseEntity.ok(ApiResponse.success(images, "전체 이미지 조회 성공"));
    }

    // 이미지 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "이미지 삭제", description = "ID로 이미지를 삭제합니다.")
    public ResponseEntity<ApiResponse<String>> deleteImage(@PathVariable("id") Long imageId) {
        Long userId = rq.getActor().getId();
        String result = imageService.deleteImage(imageId, userId);
        return ResponseEntity.ok(ApiResponse.success(result, "이미지 삭제 성공"));
    }

    // 이미지 보기 (브라우저에 직접 출력)
    @GetMapping("/view/{id}")
    @Operation(summary = "이미지 보기", description = "ID로 이미지를 브라우저에 표시합니다.")
    public ResponseEntity<Resource> viewImage(@PathVariable("id") Long id) {
        return imageService.viewImage(id);
    }

}
