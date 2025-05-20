package com.malnutrition.backend.domain.lecture.qnaboard.controller;

import com.malnutrition.backend.domain.lecture.qnaboard.dto.LectureQnaGroupDto;
import com.malnutrition.backend.domain.lecture.qnaboard.dto.QnaBoardRequestDto;
import com.malnutrition.backend.domain.lecture.qnaboard.dto.QnaBoardResponseDto;
import com.malnutrition.backend.domain.lecture.qnaboard.service.QnaBoardService;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/qna")
@RequiredArgsConstructor
@Tag(name = "QnaBoard", description = "Q&A 게시판 관련 API")
public class QnaBoardController {

    private final QnaBoardService qnaBoardService;
    private final Rq rq;

    @Operation(summary = "Q&A 질문 생성", description = "사용자 ID를 기반으로 Q&A 질문을 등록합니다.")
    @PostMapping
    public
    ResponseEntity<ApiResponse<ApiResponse<QnaBoardResponseDto>>> createQna(
            @Parameter(description = "사용자 ID") @RequestParam("userId") Long userId,
            @RequestBody QnaBoardRequestDto requestDto) {
        return ResponseEntity.ok(ApiResponse.success(qnaBoardService.createQna(userId, requestDto),"생성성공"));
        }

    @Operation(summary = "Q&A 질문 단건 조회", description = "QnA 게시글 ID로 특정 질문을 조회합니다.")
    @GetMapping("/{qnaId}")
    public
    ResponseEntity
            <ApiResponse<ApiResponse<QnaBoardResponseDto>>> getQna(
            @Parameter(description = "QnA 게시글 ID") @PathVariable("qnaId") Long qnaId) {
        return ResponseEntity.ok(ApiResponse.success(qnaBoardService.getQna(qnaId),"조회성공"));
    }

    @Operation(summary = "전체 Q&A 질문 조회", description = "등록된 모든 QnA 질문을 조회합니다.")
    @GetMapping
    public ResponseEntity
            <ApiResponse<ApiResponse<List<QnaBoardResponseDto>>>> getAllQnas() {
        return ResponseEntity.ok(ApiResponse.success(qnaBoardService.getAllQnas(),"전체조회성공"));
    }

    @Operation(summary = "Q&A 질문 수정", description = "QnA 게시글 ID로 질문을 수정합니다.")
    @PutMapping("/{qnaId}")
    public ResponseEntity<ApiResponse<ApiResponse<QnaBoardResponseDto>>> updateQna(
            @Parameter(description = "QnA 게시글 ID") @PathVariable("qnaId") Long qnaId,
            @RequestBody QnaBoardRequestDto requestDto) {
        return ResponseEntity.ok(ApiResponse.success(qnaBoardService.updateQna(qnaId, requestDto),"수정성공"));
    }

    @Operation(summary = "Q&A 질문 삭제", description = "QnA 게시글 ID로 질문을 삭제합니다.")
    @DeleteMapping("/{qnaId}")
    public ResponseEntity<ApiResponse<Void>> deleteQna(
            @Parameter(description = "QnA 게시글 ID") @PathVariable("qnaId") Long qnaId) {
        qnaBoardService.deleteQna(qnaId);
        return ResponseEntity.ok(ApiResponse.success(null,"삭제성공"));
    }

    @GetMapping("/trainer")
    public ResponseEntity<?> getQnaBoardsByTrainer(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long trainerId = rq.getActor().getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<QnaBoardResponseDto> result = qnaBoardService.getQnaBoardsByTrainer(trainerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "트레이너의 QnA 조회 성공"));
    }

    @GetMapping("/trainer/qna")
    public ResponseEntity<?> getQnaByLectureId(
            @RequestParam Long lectureId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long trainerId =rq.getActor().getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        Page<QnaBoardResponseDto> result = qnaBoardService.getQnaByLectureId(lectureId, trainerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "QnA 목록 조회 성공"));
    }
}
