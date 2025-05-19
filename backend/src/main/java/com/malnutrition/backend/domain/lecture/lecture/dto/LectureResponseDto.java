package com.malnutrition.backend.domain.lecture.lecture.dto;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LectureResponseDto {
    private Long id;
    private String title;
    private String content;
    private Long price;
    private String lectureLevel;
    private String lectureLevelDescription;
    private String lectureStatus;
    private String lectureStatusDescription;

    public static LectureResponseDto transDto(Lecture lecture) {
        return LectureResponseDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .content(lecture.getContent())
                .price(lecture.getPrice())
                .lectureLevel(lecture.getLectureLevel().name())
                .lectureLevelDescription(lecture.getLectureLevel().getDescription())
                .lectureStatus(lecture.getLectureStatus().name())
                .lectureStatusDescription(lecture.getLectureStatus().getDescription())
                .build();
    }
}