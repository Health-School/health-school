package com.malnutrition.backend.domain.lecture.lecture.dto;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class LectureDto {
    private Long id;
    private String title;
    private String content;
    private Long price;
    private String lectureStatus;
    private String lectureLevel;
    private String trainerName;

    public static LectureDto from(Lecture lecture) {
        return LectureDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .content(lecture.getContent())
                .price(lecture.getPrice())
                .lectureStatus(lecture.getLectureStatus().name())
                .lectureLevel(lecture.getLectureLevel().name())
                .trainerName(lecture.getTrainer().getNickname()) // getUsername은 User 엔티티에 맞게 수정
                .build();
    }
}
