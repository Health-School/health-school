package com.malnutrition.backend.domain.lecture.lectureCategory.entity;

import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lecture_categories")
public class LectureCategory extends BaseEntity {

    @Column(nullable = false)
    private String categoryName;

    @Column(nullable = true)
    private String description; //설명z
}