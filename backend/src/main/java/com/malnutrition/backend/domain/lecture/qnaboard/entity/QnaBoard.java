package com.malnutrition.backend.domain.lecture.qnaboard.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.qnaboard.enums.OpenStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "qna_boards")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class QnaBoard {
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "lecture_id")
    private Lecture lecture;
    @Enumerated(EnumType.STRING)
    private OpenStatus openStatus;
}
