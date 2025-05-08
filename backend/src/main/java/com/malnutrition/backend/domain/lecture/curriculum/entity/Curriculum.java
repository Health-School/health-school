package com.malnutrition.backend.domain.lecture.curriculum.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "curriculums")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Curriculum {
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "lecture_id")  // FK 이름을 명시적으로 지정
    private Lecture lecture;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "LONGTEXT")
    private String content;
    @Column(nullable = false)
    private Integer sequence;
    @Column(nullable = false)
    private String lectureUrl;
    @Column(nullable = false)
    private String urlCode;
}
