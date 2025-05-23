package com.malnutrition.backend.domain.lecture.comment.service;

import com.malnutrition.backend.domain.lecture.comment.dto.CommentRequestDto;
import com.malnutrition.backend.domain.lecture.comment.dto.CommentResponseDto;
import com.malnutrition.backend.domain.lecture.comment.entity.Comment;
import com.malnutrition.backend.domain.lecture.comment.repository.CommentRepository;
import com.malnutrition.backend.domain.lecture.qnaboard.entity.QnaBoard;
import com.malnutrition.backend.domain.lecture.qnaboard.repository.QnaBoardRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final QnaBoardRepository qnaBoardRepository;
    private final UserRepository userRepository;

    //  댓글 등록
    @Transactional
    public Long createComment(CommentRequestDto dto) {
        QnaBoard qnaBoard = qnaBoardRepository.findById(dto.getQnaboardId())
                .orElseThrow(() -> new EntityNotFoundException("QnA 게시글이 존재하지 않습니다."));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("사용자가 존재하지 않습니다."));

        Comment parent = null;
        if (dto.getParentCommentId() != null) {
            parent = commentRepository.findById(dto.getParentCommentId())
                    .orElseThrow(() -> new EntityNotFoundException("부모 댓글이 존재하지 않습니다."));
        }

        Comment comment = Comment.builder()
                .content(dto.getContent())
                .qnaBoard(qnaBoard)
                .user(user)
                .parentComment(parent)
                .build();

        return commentRepository.save(comment).getId();
    }

    //  댓글 수정
    @Transactional
    public void updateComment(Long commentId, CommentRequestDto dto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글이 존재하지 않습니다."));

        comment.setContent(dto.getContent());
    }

    //  댓글 삭제
    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글이 존재하지 않습니다."));

        commentRepository.delete(comment);
    }

    //  댓글 전체 조회 (대댓글 포함 트리 구조로 반환)
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByQnaBoard(Long qnaBoardId) {
        List<Comment> comments = commentRepository.findByQnaBoardId(qnaBoardId);

        // Comment → CommentResponseDto 로 변환
        Map<Long, CommentResponseDto> dtoMap = new HashMap<>();
        List<CommentResponseDto> roots = new ArrayList<>();

        for (Comment comment : comments) {
            CommentResponseDto dto = CommentResponseDto.builder()
                    .id(comment.getId())
                    .content(comment.getContent())
                    .userId(comment.getUser().getId())
                    .userNickname(comment.getUser().getNickname())
                    .createdAt(comment.getCreatedDate())
                    .updatedAt(comment.getUpdatedDate())
                    .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                    .childComments(new ArrayList<>())
                    .build();

            dtoMap.put(comment.getId(), dto);
        }

        // 트리 구조 구성
        for (Comment comment : comments) {
            CommentResponseDto dto = dtoMap.get(comment.getId());
            if (comment.getParentComment() != null) {
                CommentResponseDto parentDto = dtoMap.get(comment.getParentComment().getId());
                parentDto.getChildComments().add(dto);
            } else {
                roots.add(dto);
            }
        }

        return roots;
    }

    @Transactional
    public List<CommentResponseDto> getMyCommentsByQnaBoardId(Long qnaBoardId, Long userId) {
        List<Comment> comments = commentRepository.findByQnaBoardIdAndUserId(qnaBoardId, userId);
        return comments.stream()
                .map(CommentResponseDto::from)
                .toList();
    }
}
