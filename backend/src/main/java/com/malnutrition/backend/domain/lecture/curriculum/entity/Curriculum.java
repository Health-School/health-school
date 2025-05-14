package com.malnutrition.backend.domain.lecture.curriculum.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Table(
        name = "curriculums",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"lecture_id", "sequence"})
        }
)
public class Curriculum extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false)
    private Integer sequence;

    @Column(name = "s3path", columnDefinition = "TEXT")
    private String s3path;
}

