package com.malnutrition.backend.domain.lecture.curriculum.controller;

import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumResponseDto;
import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumUpdateRequestDto;
import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumUploadRequestDto;
import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.curriculum.service.CurriculumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.AccessDeniedException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/curriculums")
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService curriculumService;
    private final S3Client s3Client;

    @Operation(summary = "커리큘럼 업로드", description = "영상 파일과 커리큘럼 정보를 함께 업로드")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CurriculumResponseDto> uploadCurriculum(
            @Parameter(description = "커리큘럼 정보") @RequestPart(name = "info") CurriculumUploadRequestDto request,
            @Parameter(description = "업로드할 영상 파일") @RequestPart(name = "file") MultipartFile file
    ) throws Exception {
        Curriculum curriculum = curriculumService.uploadVideo(
                request.getLectureId(),
                file,
                request.getTitle(),
                request.getContent(),
                request.getSequence()
        );
        return ResponseEntity.ok(CurriculumResponseDto.from(curriculum));
    }

    @Operation(summary = "커리큘럼 상세 조회", description = "강의 및 강사 정보까지 포함된 커리큘럼 상세 조회")
    @GetMapping("/{curriculumId}")
    public ResponseEntity<CurriculumResponseDto> getCurriculum(@PathVariable(name = "curriculumId") Long curriculumId) {
        CurriculumResponseDto responseDto = curriculumService.findDtoById(curriculumId);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "커리큘럼 영상 스트리밍", description = "커리큘럼 ID를 받아 S3에서 영상을 스트리밍합니다.")
    @GetMapping("/{curriculumId}/video")
    public ResponseEntity<InputStreamResource> streamVideo(@PathVariable(name = "curriculumId") Long curriculumId) throws Exception {
        CurriculumResponseDto responseDto = curriculumService.findDtoById(curriculumId);
        String s3path = responseDto.getS3path();
        String filename = URLEncoder.encode(s3path.substring(s3path.lastIndexOf('/') + 1), StandardCharsets.UTF_8);

        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(curriculumService.getCurriculumS3Service().getBucket())
                .key(s3path)
                .build();

        InputStream s3Object = s3Client.getObject(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaTypeFactory.getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM))
                .body(new InputStreamResource(s3Object));
    }

    @Operation(summary = "커리큘럼 수정", description = "기존 커리큘럼 내용을 수정합니다. (영상도 선택적으로 수정 가능)")
    @PutMapping(value = "/{curriculumId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCurriculum(
            @PathVariable(name = "curriculumId") Long curriculumId,
            @Parameter(description = "수정할 정보") @ModelAttribute CurriculumUpdateRequestDto dto
    ) throws IOException {
        try {
            Curriculum updated = curriculumService.updateCurriculum(curriculumId, dto);
            return ResponseEntity.ok(CurriculumResponseDto.from(updated));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @Operation(summary = "커리큘럼 삭제", description = "S3의 영상 파일과 DB의 커리큘럼 정보를 모두 삭제합니다.")
    @DeleteMapping("/{curriculumId}")
    public ResponseEntity<Void> deleteCurriculum(@PathVariable(name = "curriculumId") Long curriculumId) {
        curriculumService.deleteCurriculum(curriculumId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
        ));
    }

}


