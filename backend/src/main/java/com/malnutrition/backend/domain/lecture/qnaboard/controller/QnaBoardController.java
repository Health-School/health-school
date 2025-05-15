package com.malnutrition.backend.domain.lecture.qnaboard.controller;

import com.malnutrition.backend.domain.lecture.qnaboard.dto.QnaBoardRequestDto;
import com.malnutrition.backend.domain.lecture.qnaboard.dto.QnaBoardResponseDto;
import com.malnutrition.backend.domain.lecture.qnaboard.service.QnaBoardService;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/qna")
@RequiredArgsConstructor
@Tag(name = "QnaBoard", description = "Q&A 게시판 관련 API")
public class QnaBoardController {

    private final QnaBoardService qnaBoardService;

    @Operation(summary = "Q&A 질문 생성", description = "사용자 ID를 기반으로 Q&A 질문을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<QnaBoardResponseDto>> createQna(
            @Parameter(description = "사용자 ID") @RequestParam("userId") Long userId,
            @RequestBody QnaBoardRequestDto requestDto) {
        return ResponseEntity.ok(qnaBoardService.createQna(userId, requestDto));
    }

    @Operation(summary = "Q&A 질문 단건 조회", description = "QnA 게시글 ID로 특정 질문을 조회합니다.")
    @GetMapping("/{qnaId}")
    public ResponseEntity<ApiResponse<QnaBoardResponseDto>> getQna(
            @Parameter(description = "QnA 게시글 ID") @PathVariable("qnaId") Long qnaId) {
        return ResponseEntity.ok(qnaBoardService.getQna(qnaId));
    }

    @Operation(summary = "전체 Q&A 질문 조회", description = "등록된 모든 QnA 질문을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<QnaBoardResponseDto>>> getAllQnas() {
        return ResponseEntity.ok(qnaBoardService.getAllQnas());
    }

    @Operation(summary = "Q&A 질문 수정", description = "QnA 게시글 ID로 질문을 수정합니다.")
    @PutMapping("/{qnaId}")
    public ResponseEntity<ApiResponse<QnaBoardResponseDto>> updateQna(
            @Parameter(description = "QnA 게시글 ID") @PathVariable("qnaId") Long qnaId,
            @RequestBody QnaBoardRequestDto requestDto) {
        return ResponseEntity.ok(qnaBoardService.updateQna(qnaId, requestDto));
    }

    @Operation(summary = "Q&A 질문 삭제", description = "QnA 게시글 ID로 질문을 삭제합니다.")
    @DeleteMapping("/{qnaId}")
    public ResponseEntity<ApiResponse<Void>> deleteQna(
            @Parameter(description = "QnA 게시글 ID") @PathVariable("qnaId") Long qnaId) {
        return ResponseEntity.ok(qnaBoardService.deleteQna(qnaId));
    }
}
