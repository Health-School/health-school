package com.malnutrition.backend.domain.lecture.qnaboard.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.qnaboard.enums.OpenStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
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
public class QnaBoard extends BaseEntity {
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id",nullable = false)
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)  // FK 이름을 명시적
    private User user;

    @Enumerated(EnumType.STRING)
    private OpenStatus openStatus;
}
