package com.malnutrition.backend.domain.lecture.comment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequestDto {
    private String content;
    private Long qnaboardId;
    private Long userId;
    private Long parentCommentId; // 대댓글일 경우에만 사용
    }
