package com.malnutrition.backend.domain.lecture.comment.entity;

import com.malnutrition.backend.domain.lecture.qnaboard.entity.QnaBoard;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "comments")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Comment {
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "qnaboard_id")  // FK 이름을 명시적
    private QnaBoard qnaBoard;
}
