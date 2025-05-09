package com.malnutrition.backend.domain.lecture.lecture.entity;


import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
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
    private Integer price;

    @Enumerated(EnumType.STRING)
    private LectureStatus lectureStatus;
    @Enumerated(EnumType.STRING)
    private LectureLevel lectureLevel;


    //강의 수강 기간은 무제한!!!


}
