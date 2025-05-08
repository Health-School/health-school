package com.malnutrition.backend.domain.lecture.lecturuser.entity;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "lecture_users")
@Getter
@Setter
@AllArgsConstructor
public class LectureUser {
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "lecture_id")  // FK 이름을 명시적으로 지정
    private Lecture lecture;
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "user_id")  // FK 이름을 명시적으로 지정
    private User user;
}
