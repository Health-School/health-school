package com.malnutrition.backend.domain.lecture.curriculumProgress.entity;

import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.curriculumProgress.enums.ProgressStatus;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "curriculum_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CurriculumProgress extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id")
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_id", nullable = false)
    private Curriculum curriculum;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status;

    @Column(nullable = true)
    private Integer progressRate = 0;

    @Column(nullable = true)
    private LocalDateTime lastWatchedAt; // 마지막으로 언제 봤는지

    @Column(nullable = true)
    private Integer lastWatchedSecond = 0; // 마지막에 어디까지 봤는지

    @Column(nullable = true)
    private LocalDateTime completedAt; // 수강 완료일

}
