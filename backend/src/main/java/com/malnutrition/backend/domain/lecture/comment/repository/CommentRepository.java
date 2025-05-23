package com.malnutrition.backend.domain.lecture.comment.repository;

import com.malnutrition.backend.domain.lecture.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByQnaBoardId(Long qnaBoardId);  //QnA 게시글에 달린 전체 댓글 불러오는거임ㅇㅇ 대댓글까지

    List<Comment> findByQnaBoardIdAndUserId(Long qnaBoardId, Long userId);
}
