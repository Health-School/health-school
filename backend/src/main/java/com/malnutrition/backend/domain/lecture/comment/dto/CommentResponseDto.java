package com.malnutrition.backend.domain.lecture.comment.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CommentResponseDto {
    private Long id;
    private String content;
    private Long userId;
    private String userNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long parentCommentId; // 대댓글일 경우

    private List<CommentResponseDto> childComments; // 대댓글 리스트
}
