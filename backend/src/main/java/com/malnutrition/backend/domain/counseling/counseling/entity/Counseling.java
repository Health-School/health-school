package com.malnutrition.backend.domain.counseling.counseling.entity;


import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "counselings")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Counseling extends BaseEntity {
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String type; //상담 종류: 운동(exercise), 건강(health) 등 자유롭게 작성

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)  // FK 이름을 명시적으로 지정
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)  // FK 이름을 명시적으로 지정
    private User trainer;

}
