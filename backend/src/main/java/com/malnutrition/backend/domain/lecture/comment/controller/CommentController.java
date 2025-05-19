package com.malnutrition.backend.domain.lecture.comment.controller;

import com.malnutrition.backend.domain.lecture.comment.dto.CommentRequestDto;
import com.malnutrition.backend.domain.lecture.comment.dto.CommentResponseDto;
import com.malnutrition.backend.domain.lecture.comment.service.CommentService;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comment")
@RequiredArgsConstructor
@Tag(name = "Comment", description = "댓글 관련 API")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 생성", description = "댓글을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createComment(@RequestBody CommentRequestDto dto) {
        Long id = commentService.createComment(dto);
        return ResponseEntity.ok(ApiResponse.success(id, "생성성공"));
    }

    @Operation(summary = "댓글 수정", description = "댓글을 수정합니다.")
    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> updateComment(
            @Parameter(description = "댓글 ID") @PathVariable("commentId") Long commentId,
            @RequestBody CommentRequestDto dto) {
        commentService.updateComment(commentId, dto);
        return ResponseEntity.ok(ApiResponse.success(null, "수정성공"));
    }

    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다.")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @Parameter(description = "댓글 ID") @PathVariable("commentId") Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.success(null, "삭제성공"));
    }

    @Operation(summary = "QnA 게시글 댓글 전체 조회", description = "QnA 게시글 ID로 댓글 전체를 조회합니다.")
    @GetMapping("/qna/{qnaBoardId}")
    public ResponseEntity<ApiResponse<List<CommentResponseDto>>> getCommentsByQnaBoard(
            @Parameter(description = "QnA 게시글 ID") @PathVariable("qnaBoardId")Long qnaBoardId) {
        List<CommentResponseDto> comments = commentService.getCommentsByQnaBoard(qnaBoardId);
        return ResponseEntity.ok(ApiResponse.success(comments, "조회성공"));
    }
}
