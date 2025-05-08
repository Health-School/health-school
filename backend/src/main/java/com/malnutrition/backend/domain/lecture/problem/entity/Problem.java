package com.malnutrition.backend.domain.lecture.problem.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "problems")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Problem {
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "lecture_id")  // FK 이름을 명시적으로 지
    private Lecture lecture;
}
