package com.malnutrition.backend.domain.lecture.like.entity;

import com.fasterxml.jackson.databind.ser.Serializers;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.apache.commons.lang3.builder.ToStringExclude;

@Entity
@Table(name = "likes")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class Like extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_user_id",nullable = false)  // FK 이름을 명시적으로 지정
    @ToStringExclude
    private LectureUser lectureUser;

    private Integer score; //0~5 점의 점수를 갖는다.
}
