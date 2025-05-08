package com.malnutrition.backend.domain.lecture.notification.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "notifications")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Notification {
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "lecture_id")  // FK 이름을 명시적으로 지정
    private Lecture lecture;
}
