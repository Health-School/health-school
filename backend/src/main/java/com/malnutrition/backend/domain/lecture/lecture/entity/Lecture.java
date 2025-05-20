package com.malnutrition.backend.domain.lecture.lecture.entity;


import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "lectures")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Lecture extends BaseEntity {
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;
    @Column(nullable = false)
    private Long price;

    @Enumerated(EnumType.STRING)
    private LectureStatus lectureStatus;
    @Enumerated(EnumType.STRING)
    private LectureLevel lectureLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private LectureCategory lectureCategory;

    //강의 수강 기간은 무제한!!! 댓글: 그건 내맘인디요
    @OneToOne(cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "image_id")
    @ToString.Exclude
    Image coverImage ;


}
