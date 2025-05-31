package com.malnutrition.backend.domain.lecture.lecture.dto;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LectureTrainerDto {
    Long id;
    String title;


    public static LectureTrainerDto from(Lecture lecture){
        return LectureTrainerDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .build();
    }
}
