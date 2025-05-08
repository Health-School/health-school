package com.malnutrition.backend.domain.lecture.like.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "likes")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Like {
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "user_id")  // FK 이름을 명시적으로 지정
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "lecture_id")  // FK 이름을 명시적으로 지정
    private Lecture lecture;
}
