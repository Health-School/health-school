package com.malnutrition.backend.domain.lecture.comment.dto;

import com.malnutrition.backend.domain.lecture.comment.entity.Comment;
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
    private Long qnaBoardId;          // 추가
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long parentCommentId;
    private List<CommentResponseDto> childComments;

    public static CommentResponseDto from(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userNickname(comment.getUser().getNickname())
                .qnaBoardId(comment.getQnaBoard().getId())  // 추가
                .createdAt(comment.getCreatedDate())
                .updatedAt(comment.getUpdatedDate())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .childComments(comment.getChildComments().stream()
                        .map(CommentResponseDto::from)
                        .toList())
                .build();
    }
}
